import { Mark } from "@tiptap/core"

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Code = Mark.create({
	name: "inline-code",
	parseHTML() {
		return [
			{ tag: "code" },
		]
	},
	renderHTML() { return ["code", 0] },
})

