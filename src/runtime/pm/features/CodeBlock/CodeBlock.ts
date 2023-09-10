import { CodeBlockLowlight as TipTapCodeBlockLowlight } from "@tiptap/extension-code-block-lowlight"
import type { Node as ProsemirrorNode } from "@tiptap/pm/model"
import { mergeAttributes, VueNodeViewRenderer } from "@tiptap/vue-3"
import { createLowlight } from "lowlight"

import { codeBlockEnterOrSplit } from "./commands/codeBlockEnterOrSplit.js"
import { codeBlockIndent } from "./commands/codeBlockIndent.js"
import { codeBlockUnindent } from "./commands/codeBlockUnindent.js"
import { focusCodeBlockLanguage } from "./commands/focusCodeBlockLanguage.js"
import CodeBlockView from "./components/CodeBlockView.vue"

// languages are registered asynchronously by useAsyncCodeBlockHighlighting
export const lowlightInstance = createLowlight()

// eslint-disable-next-line @typescript-eslint/naming-convention
export const CodeBlock = TipTapCodeBlockLowlight.extend({
	name: "codeBlock" satisfies NodeCodeBlockName,
	group: "block",
	marks: "",
	addOptions() {
		return {
			...(this as any).parent?.(),
			defaultLanguage: null,
			lowlight: lowlightInstance
		}
	},

	addAttributes() {
		return {
			...(this as any).parent?.(),
			language: {
				default: ""
			},
			loading: {
				default: true
			}
		}
	},
	parseHTML() {
		return [
			{
				// pre > code not working?
				tag: "pre",
				preserveWhitespace: "full",
				getAttrs: (node: HTMLElement) => {
					const child = node.children[0]
					if (!child) return false
					const language = child.getAttribute("language")
					if (language) {
						return { language }
					}
					const match = Array.from(node.classList).find(_ => _.startsWith("language-"))
					if (match) {
						return {
							language: match.slice("language-".length)
						}
					}
					return false
				}
			}
		]
	},

	// eslint-disable-next-line @typescript-eslint/naming-convention
	renderHTML({ node, HTMLAttributes }: { node: ProsemirrorNode, HTMLAttributes: any }) {
		const classes = node.attrs.language
			? this.options.languageClassPrefix + node.attrs.language
			: ""
		return [
			"pre",
			[
				"code",
				mergeAttributes(
					this.options.HTMLAttributes,
					{ language: node.attrs.language },
					HTMLAttributes,
					{
						class: `${classes} ${HTMLAttributes?.class ?? this.options.HTMLAttributes?.class ?? ""}`
					}
				),
				0
			]
		]
	},
	addNodeView() {
		// am having lint only issues
		return VueNodeViewRenderer(CodeBlockView)
	},
	addCommands() {
		const self = this as any
		return {
			...self?.parent?.(),
			codeBlockEnterOrSplit: codeBlockEnterOrSplit(this.name),
			focusCodeBlockLanguage: focusCodeBlockLanguage(this.name),
			codeBlockIndent: codeBlockIndent(this.name),
			codeBlockUnindent: codeBlockUnindent(this.name)
		}
	},
	addKeyboardShortcuts() {
		return {}
	}
})

export type NodeCodeBlockName = "codeBlock"
