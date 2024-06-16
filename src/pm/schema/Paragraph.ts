import { mergeAttributes, Node } from "@tiptap/core"

import type { HTMLAttributesOptions } from "../../types.js"


// eslint-disable-next-line @typescript-eslint/naming-convention
export const Paragraph = Node.create<HTMLAttributesOptions>({
	name: "paragraph",
	group: "block",
	// draggable: false,
	content: "inline*",
	addOptions() {
		return { HTMLAttributes: {} }
	},
	parseHTML() { return [{ tag: "p" }] },
	// eslint-disable-next-line @typescript-eslint/typedef
	renderHTML({ HTMLAttributes: attrs }) {
		return [
			"p",
			mergeAttributes(this.options.HTMLAttributes, attrs, {
				class: "pm-block block",
			}),
			0,
		]
	},
})

