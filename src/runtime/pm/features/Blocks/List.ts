import { mergeAttributes, Node } from "@tiptap/core"

import { setNode } from "./commands/setNode.js"
import type { ListNodeOptions } from "./types.js"

// eslint-disable-next-line @typescript-eslint/naming-convention
export const List = Node.create<ListNodeOptions>({
	name: "list" satisfies NodeListName,
	content: "item+",
	allowGapCursor: true,
	addOptions() {
		return { HTMLAttributes: {} }
	},
	addAttributes() {
		return {
			type: {
				default: "list"
			}
		}
	},

	addCommands() {
		return {
			// override tiptap's setNode
			setNode: setNode()
		}
	},
	parseHTML() {
		const getAttrs = (node: HTMLElement): false | { type: string } => {
			const type = (node as HTMLElement).getAttribute("node-type")
			if (type === "list") {
				return { type }
			} else return false
		}
		return [
			{
				tag: "ul",
				getAttrs

			},
			{
				tag: "ol",
				getAttrs
			}
		]
	},

	// eslint-disable-next-line @typescript-eslint/naming-convention
	renderHTML({ HTMLAttributes, node }) {
		return [
			"ul",
			mergeAttributes(
				this.options.HTMLAttributes,
				{
					"node-type": node.attrs.type,
					role: "list"
				},
				HTMLAttributes,
				{
					class: `list flex flex-col gap-1 ${HTMLAttributes?.class ?? this.options.HTMLAttributes?.class ?? ""}`
				}
			),
			0
		]
	}
})
export type NodeListName = "list"
