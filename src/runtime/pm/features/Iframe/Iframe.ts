import { mergeAttributes, Node, nodePasteRule, type PasteRuleMatch } from "@tiptap/core"
import { VueNodeViewRenderer } from "@tiptap/vue-3"

import IframeNodeView from "./components/IframeNodeView.vue"
import { defaultAllow, InstagramSourceParser, VimeoSourceParser, YoutubeSourceParser } from "./IframeParsers.js"
import type { IframeNodeOptions } from "./types.js"

declare module "@tiptap/core" {

	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		iframe: {
			/**
			 * Add an iframe
			 */
			setIframe: (options: { src: string }) => ReturnType
			/**
			 * Set the options for the iframe plugin, such as the default HTMLAttributes and the url handlers.
			 */
			setIframeOptions: (options: IframeNodeOptions) => ReturnType
			openExternalLink: (url: string) => ReturnType
		}
	}
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Iframe = Node.create<IframeNodeOptions>({
	name: "iframe" satisfies NodeIframeName,

	group: "block",

	atom: true,

	addOptions() {
		return {
			HTMLAttributes: {
			},
			handlers: {
				youtube: new YoutubeSourceParser(),
				instagram: new InstagramSourceParser(),
				vimeo: new VimeoSourceParser()
			}
		}
	},

	addAttributes() {
		return {
			src: {
				default: null
			},
			frameborder: {
				default: 0
			},
			allow: defaultAllow,
			aspectRatio: {
				default: 16 / 9
			}
		}
	},

	parseHTML() {
		return [{
			tag: "iframe",
			getAttrs: (element: HTMLElement) => {
				const src = element.getAttribute("src")
				if (!src) {
					return false
				}
				for (const value of Object.values(this.options.handlers)) {
					if (value.matchUrl?.test(src)) {
						const attrs = value.parseAttributes(element)
						if (attrs) {
							return {
								...attrs,
								src: value.cleanUrl(src)
							}
						}
					}
				}
				return { src }
			}
		}]
	},

	// eslint-disable-next-line @typescript-eslint/naming-convention
	renderHTML({ HTMLAttributes }) {
		return [
			"div",
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
				class: `
					iframe-wrapper
					group/embed
					relative
					w-[99%]
					max-w-[var(--pm-max-embed-width)]
					${HTMLAttributes?.class ?? this.options.HTMLAttributes?.class ?? ""}
				`
			}),
			[
				"iframe",
				{ class: "w-full aspect-video" }
			]
		]
	},
	addPasteRules() {
		return [
			nodePasteRule({
				find: text => {
					for (const [key, value] of Object.entries(this.options.handlers)) {
						if (!value.matchUrl) continue
						const res = text.match(value.matchUrl)

						if (res) {
							return [
								{
									...res,
									text,
									index: 0,
									type: key
								} satisfies PasteRuleMatch & { type: string }
							]
						}
					}
					return null
				},
				type: this.type,
				getAttributes: match => {
					for (const value of Object.values(this.options.handlers)) {
						if (value.matchUrl && match[0].match(value.matchUrl)) {
							return {
								...value.defaultAttributes,
								src: value.cleanUrl(match[0])

							}
						}
					}
					return false
				}
			})
		]
	},
	addNodeView() {
		// am having lint only issues
		return VueNodeViewRenderer(IframeNodeView)
	},
	addCommands() {
		return {
			setIframe: (options: { src: string }) => ({ tr, dispatch }) => {
				const { selection } = tr
				const node = this.type.create(options)

				if (dispatch) {
					tr.replaceRangeWith(selection.from, selection.to, node)
				}

				return true
			},
			setIframeOptions: (options: IframeNodeOptions) => ({ commands }) => commands.updateAttributes(this.name, options)
		}
	}
})

export type NodeIframeName = "iframe"
