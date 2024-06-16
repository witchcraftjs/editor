import { Mark } from "@tiptap/core"
import { type ParseRule } from "prosemirror-model"

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Bold = Mark.create({
	name: "bold",
	parseHTML() {
		return [
			{ tag: "strong" },
{
	tag: "b",
	getAttrs: node => (node as HTMLElement).style.fontWeight !== "normal" && null,
} satisfies ParseRule,
{
	style: "font-weight",
	getAttrs: value => /^(bold(er)?|[5-9]\d{2,})$/.test(value as string) && null,
} satisfies ParseRule,
		]
	},
	renderHTML() { return ["strong", { style: "font-weight: bold" }, 0] },
})

