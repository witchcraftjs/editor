import { mergeAttributes } from "@tiptap/core"
import TipTapImage, { type ImageOptions } from "@tiptap/extension-image"
import { VueNodeViewRenderer } from "@tiptap/vue-3"

import FileNodeView from "./components/FileNodeView.vue"
import type { FileNodeOptions, ParsedFileAttrs } from "./types.js"

/**
 * File extension — renders images and generic files inline.
 *
 * Extends TipTap's Image extension to support both image and non-image files.
 *
 * Note that displaying non-image files requires injecting a custom file viewing component. The default can only handle images.
 *
 * Both have an id property always (to be used with the FileInsert extension).
 *
 * The {@link FileNodeOptions.renderHTMLAsImage} option controls HTML output format (this is only used for exporting). The default always renders as `<img>`.
 * - Returns `true` → renders as `<img>` tag using the `src` attribute if available.
 * - Returns `false` → renders as `<div type="file" data-id="...">`
 * 	- Note no data is outputted. If you need more advanced output, either wrap the html generation and modify it (you will need to do it this way if any data you need is async) or override renderHTML on the extension.
 *
 * ## Custom File Viewing Component
 *
 * To properly take advantage and use non-image files, you must provide a custom file viewing component.
 *
 * ```ts
 * import { provide } from "vue"
 * import { fileViewInjectionKey, type FileViewProps } from "@witchcraft/editor/pm/features/File/types"
 * import MyFilePreview from "./MyFilePreview.vue"
 *
 * provide(fileViewInjectionKey, MyFilePreview)
 * ```
 *
 * The injected component receives {@link FileViewProps} as direct props.
 *
 * The suggested usage is to have the component aware of how to fetch/display the file based on it's id, and avoid relying on prosemirror node attributes.
 *
 * The view can then be whatever you need (thumbnail, image, etc.) It could even be async.
 *
 * The component is wrapped in a container div with resize handles, so it does not need to implement resize logic itself.
 *
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const File = TipTapImage
	.extend<ImageOptions & FileNodeOptions>({
		name: "file",

		addOptions() {
			return {
				...(this as any).parent?.(),
				inline: true,
				HTMLAttributes: {
					class: `
						rounded-xs
						h-auto
						[&.ProseMirror-selectednode]:outline
						[&.ProseMirror-selectednode]:outline-offset-0
						[&.ProseMirror-selectednode]:outline-accent-500
					`
				},
				allowBase64: true,
				renderHTMLAsImage: () => true,
				onParseHTML: undefined
			}
		},

		addAttributes() {
			return {
				...(this as any).parent?.(),
				width: {
					default: undefined
				},
				height: {
					default: undefined
				},
				id: {
					default: undefined
				},
				ignoreAspectOnResize: {
					default: undefined
				}
			}
		},

		parseHTML() {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			const applyOnParseHTML = (dom: HTMLElement, attrs: ParsedFileAttrs): ParsedFileAttrs | false => {
				// eslint-disable-next-line @typescript-eslint/naming-convention
				const { onParseHTML } = this.options
				if (!onParseHTML) {
					return attrs
				}
				const result = onParseHTML(dom, attrs)
				if (result === false) {
					return false
				}
				if (result === undefined) {
					return attrs
				}
				return { ...attrs, ...result }
			}

			return [
				// images parse from <img> tags
				{
					tag: "img",
					getAttrs(dom: HTMLElement) {
						const src = dom.getAttribute("src")
						const width = dom.getAttribute("width")
						const height = dom.getAttribute("height")
						const id = dom.getAttribute("data-id")
						const ignoreAspectOnResize = dom.getAttribute("data-ignore-aspect-on-resize")
						const attrs: ParsedFileAttrs = {
							src: src ?? undefined,
							width: width ? Number.parseInt(width, 10) : undefined,
							height: height ? Number.parseInt(height, 10) : undefined,
							id: id ?? undefined,
							ignoreAspectOnResize: ignoreAspectOnResize === "true" ? true : ignoreAspectOnResize === "false" ? false : undefined
						}
						return applyOnParseHTML(dom, attrs)
					}
				},
				// non-image files parse from <div type="file">
				{
					tag: "div[type=\"file\"]",
					getAttrs(dom: HTMLElement) {
						const id = dom.getAttribute("data-id")
						if (!id) {
							return false
						}
						const width = dom.getAttribute("width")
						const height = dom.getAttribute("height")
						const ignoreAspectOnResize = dom.getAttribute("data-ignore-aspect-on-resize")
						const attrs: ParsedFileAttrs = {
							id,
							width: width ? Number.parseInt(width, 10) : undefined,
							height: height ? Number.parseInt(height, 10) : undefined,
							ignoreAspectOnResize: ignoreAspectOnResize === "true" ? true : ignoreAspectOnResize === "false" ? false : undefined
						}
						return applyOnParseHTML(dom, attrs)
					}
				}
			]
		},

		// eslint-disable-next-line @typescript-eslint/naming-convention
		renderHTML({ node, HTMLAttributes }: any) {
			if (!this.options.renderHTMLAsImage(node)) {
				const attrs: Record<string, string | number> = { type: "file" }
				attrs["data-id"] = node.attrs.id
				attrs.src = node.attrs.src
				attrs["data-ignore-aspect-on-resize"] = node.attrs.ignoreAspectOnResize
				return ["div", mergeAttributes(HTMLAttributes, attrs)]
			}

			const attrs = { ...HTMLAttributes }
			attrs.width = node.attrs.width
			attrs.height = node.attrs.height
			attrs["data-id"] = node.attrs.id
			attrs["data-ignore-aspect-on-resize"] = node.attrs.ignoreAspectOnResize
			return [
				"img",
				mergeAttributes(this.options.HTMLAttributes, attrs)
			]
		},

		addNodeView() {
			return VueNodeViewRenderer(FileNodeView)
		}
	})
