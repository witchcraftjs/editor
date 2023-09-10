import { InputRule, mergeAttributes, Node } from "@tiptap/core"
import { Blockquote as TiptapBlockquote } from "@tiptap/extension-blockquote"
import { TextSelection } from "@tiptap/pm/state"

import { blockquoteEnter } from "./commands/blockquoteEnter.js"
import { blockquoteShiftEnter } from "./commands/blockquoteShiftEnter.js"

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Blockquote = TiptapBlockquote.extend({
	name: "blockquote" satisfies NodeBlockquoteName,
	content: "paragraph+ cite?",
	addOptions() {
		return {

			...(this as any).parent?.(),
			HTMLAttributes: {
				class: "border-l-4 border-neutral-400 pl-2 dark:border-neutral-600"
			}
		}
	},
	addCommands() {
		return {
			blockquoteShiftEnter: blockquoteShiftEnter(this.name),
			blockquoteEnter: blockquoteEnter(this.name)
		}
	}
})

export type NodeBlockquoteName = "blockquote"

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Cite = Node.create({
	name: "cite" satisfies NodeCiteName,
	content: "inline+",
	parseHTML() {
		return [
			{ tag: "cite" }
		]
	},

	// eslint-disable-next-line @typescript-eslint/naming-convention
	renderHTML({ HTMLAttributes }) {
		return [
			"cite",
			mergeAttributes(HTMLAttributes, {
				class: "text-neutral-700 dark:text-neutral-400 before:content-['—']"
			}),
			0
		]
	},
	addInputRules() {
		return [
			// tiptap's nodeInputRule doesn't work well at all for this situation
			new InputRule({
				find: /(?:^|\s)---\s?$/,
				handler: ({ state, range }) => {
					const { tr } = state
					const start = range.from
					const end = range.to
					const insertionStart = start - 1
					const $pos = tr.doc.resolve(insertionStart)
					if ($pos.node().type.name !== "blockquote") {
						return null
					}
					tr.delete(insertionStart, end)
					tr.insert(insertionStart, this.type.create())
					tr.setSelection(TextSelection.create(tr.doc, tr.mapping.map(insertionStart)))
					tr.scrollIntoView()
					return undefined
				}
			})
		]
	}
})
export type NodeCiteName = "cite"
