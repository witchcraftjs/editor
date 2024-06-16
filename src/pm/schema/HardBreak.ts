import { Node } from "@tiptap/core"

// eslint-disable-next-line @typescript-eslint/naming-convention
export const HardBreak = Node.create({
	name: "hardBreak",
	inline: true,
	group: "inline",
	// selectable: false,
	renderHTML() { return ["br"] },
	parseHTML() { return [{ tag: "br" }] },
})

