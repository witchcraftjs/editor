import { mergeAttributes, Node } from "@tiptap/core"

import type { HTMLAttributesOptions } from "../../types.js"
import { rawCommands } from "../commands/index.js"

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Heading = Node.create<HTMLAttributesOptions & {
	levels: number[]
}>({
	name: "heading",
	group: "block",
	content: "inline*",
	// draggable: false,
	addOptions() {
		return {
			levels: [1, 2, 3, 4, 5, 6],
			HTMLAttributes: {},
		}
	},
	addAttributes() {
		return {
			level: {
				default: undefined,
				rendered: false,
			},
		}
	},
	parseHTML() {
		return this.options.levels.map(level => ({ tag: `h${level}`, attrs: { level } }))
	},
	// eslint-disable-next-line @typescript-eslint/typedef
	renderHTML({ HTMLAttributes: attrs, node }) {
		const level = this.options.levels.includes(node.attrs.level)
? node.attrs.level
: this.options.levels[0]
		const classMap = [
			"text-6xl/normal",
			"text-5xl/normal",
			"text-4xl/normal",
			"text-3xl/normal",
			"text-2xl/normal",
			"text-xl",
		]

		return [
`h${level}`,
mergeAttributes(this.options.HTMLAttributes, attrs, {
	class: `pm-block block ${classMap[level - 1]!}`,
	level,
}),
0,
		]
	},
	addCommands() {
		return {
			changeLevelAttr: rawCommands.changeLevelAttr.create({
				attributeKey: "level",
				nodeType: this.type,
				allowedValues: this.options.levels,
				fallbackGroups: ["block"],
			}),
		}
	},
})

