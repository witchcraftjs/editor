import type { Extension } from "@tiptap/core"
import TipTapImage from "@tiptap/extension-image"
import { mergeAttributes, VueNodeViewRenderer } from "@tiptap/vue-3"

import ImageNodeView from "./components/ImageNodeView.vue"

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Image = (TipTapImage as any as Extension /* vue-tsc issue */)
	.extend({
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
				allowBase64: true
			}
		},
		addAttributes() {
			return {
				...(this as any).parent?.(),
				width: {
					default: null
				},
				height: {
					default: null
				}
			}
		},
		parseHTML() {
			return [
				{
					tag: "img[src]",
					getAttrs(dom: HTMLElement) {
						const src = dom.getAttribute("src")
						if (!src) {
							return false
						}
						const width = dom.getAttribute("width")
						const height = dom.getAttribute("height")
						return {
							src,
							width: width ? Number.parseInt(width, 10) : null,
							height: height ? Number.parseInt(height, 10) : null
						}
					}
				}
			]
		},
		// eslint-disable-next-line @typescript-eslint/naming-convention
		renderHTML({ node, HTMLAttributes }) {
			const attrs = { ...HTMLAttributes }
			if (node.attrs.width != null) {
				attrs.width = node.attrs.width
			}
			if (node.attrs.height != null) {
				attrs.height = node.attrs.height
			}
			return [
				"img",
				mergeAttributes(this.options.HTMLAttributes, attrs)
			]
		},
		addNodeView() {
			return VueNodeViewRenderer(ImageNodeView)
		}
	})
