import { Mark } from "@tiptap/core"


export const Italic = Mark.create({
	name: "italic",
	parseHTML() {
		return [
			{
				tag: "i",
				getAttrs: node => (node as HTMLElement).style.fontStyle !== "normal" && null,
			},
			{
				tag: "em",
				getAttrs: node => (node as HTMLElement).style.fontStyle !== "normal" && null,
			},
			{ style: "font-style=italic" },
		]
	},
	renderHTML() { return ["em", 0] },
})

