import { mergeAttributes, Node } from "@tiptap/core"

// eslint-disable-next-line @typescript-eslint/naming-convention
export const List = Node.create({
	name: "list",
	content: "item+",

	addOptions() {
		return { HTMLAttributes: {} }
	},
	addAttributes() {
		return {
			type: {
				default: "list",
			},
		}
	},


	parseHTML() {
		return [
			{
				tag: "div",
				getAttrs: node => {
					const type = (node as HTMLElement).getAttribute("node-type")
					if (type === "list") {
						return { type }
					} else return false
				},
			},
			{ tag: "ol" },
			{ tag: "ul" },
		]
	},
	// eslint-disable-next-line @typescript-eslint/typedef
	renderHTML({ HTMLAttributes: attrs }) {
		return [
			"div",
			mergeAttributes(
				this.options.HTMLAttributes,
				{
					"node-type": attrs.type,
					role: "list",
				}
			),
			0,
		]
	},
})

