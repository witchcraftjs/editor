import { mergeAttributes, Node } from "@tiptap/core"

import type { HTMLAttributesOptions } from "../../types.js"


// eslint-disable-next-line @typescript-eslint/naming-convention
export const Image = Node.create<HTMLAttributesOptions & {}>({
	name: "image",
	group: "inline",
	inline: true,
	// draggable: false,
	addAttributes() {
		return {
			src: { default: "" },
		}
	},
	parseHTML() { return [{ tag: "image" }] },
	// eslint-disable-next-line @typescript-eslint/typedef
	renderHTML({ HTMLAttributes: attrs }) {
		return [
			"image",
			mergeAttributes(this.options.HTMLAttributes, attrs),
			0,
		]
	},
})

