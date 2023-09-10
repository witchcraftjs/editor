import { closeHistory } from "prosemirror-history"
import type { NodeType } from "prosemirror-model"
import type { EditorState } from "prosemirror-state"

import { Dispatch, SELF } from "@/components/Editor/types"
import { find_next, find_up } from "@/components/Editor/utils"


export const sink_list = (type: NodeType) => (state: EditorState, dispatch: Dispatch): boolean => {
	let { $from, $to } = state.selection
	let $from_item = find_up(state.doc, $from, { start: SELF }, $node => $node.node().type === type)
	let $to_item = find_up(state.doc, $to, { start: SELF }, $node => $node.node().type === type)
	if (!$to_item || !$from_item) return false

	let prev_pos = $from_item.start() - 2
	if (prev_pos <= 2) return false
	let $prev_item = state.doc.resolve(prev_pos)
	if (!$prev_item) return false
	if ($prev_item.node().attrs.level < $from_item.node().attrs.level) return false

	let tr = state.tr
	let stop_marking = false
	let last_level!: number

	find_next(state.doc, $from_item, { start: SELF }, $node => {
		let pos = $node.pos
		let attrs = $node.node().attrs
		let level: number = attrs.level
		if (!stop_marking) {
			tr.setNodeMarkup($node.pos - 1, undefined, { ...attrs, level: level + 1 })
		} else {
			if (level > last_level) {
				tr.setNodeMarkup($node.pos - 1, undefined, { ...attrs, level: level + 1 })
			} else {
				return true
			}
		}
		if (pos === $to_item!.pos) {
			stop_marking = true
			last_level = level
		}
		return false
	})
	closeHistory(tr)
	dispatch(tr)
	return true
}
