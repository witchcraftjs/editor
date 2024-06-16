/* eslint-disable no-console */
/* eslint-disable no-unreachable */
/* eslint-disable no-inner-declarations */
import { closeHistory } from "prosemirror-history"
import type { NodeType, ResolvedPos } from "prosemirror-model"
import { EditorState, TextSelection } from "prosemirror-state"

import { Command, Dispatch, NEXT } from "@/components/Editor/types"
import { find_equal_level_nodes, find_next } from "@/components/Editor/utils/"

/**
 * Move a list item down.
 * Optionally force selection to conform to depths (more content will be moved if necessary to not create instance where items might be more than 1 level away from their parents)
 */
export const move_list_down = (item: NodeType): Command => (state: EditorState, dispatch: Dispatch): boolean => {
	let { from, to } = state.selection
	let { $start, $end } = find_equal_level_nodes(state.doc, state.selection, item)
	if (!$start || !$end) return false
	let start_node = $start.node()

	let direct_next_pos = $end.end() + 2
	if (direct_next_pos >= state.doc.nodeSize - 2) return false
	let $direct_next = state.doc.resolve(direct_next_pos)

	let insert_below = true
	let $next_item = find_next(state.doc, $end, { start: NEXT }, $node => {
		let node = $node.node()
		if (node.type !== item) return false
		let is_same_level = node.attrs.level === start_node.attrs.level
		let is_level_above = node.attrs.level === start_node.attrs.level - 1
		let is_way_above = node.attrs.level < start_node.attrs.level - 1

		if (is_way_above) {
			insert_below = false
			return false
		} else if (is_same_level || is_level_above) {
			if (is_level_above) {
				insert_below = true
			}
			return true
		}
		return false
	})

	if (!$next_item) return false
	let next_item_level = $next_item.node().attrs.level

	if (insert_below && next_item_level === start_node.attrs.level) {
		let $next_item_last_child: ResolvedPos | undefined

		find_next(state.doc, $next_item, { start: NEXT }, $node => {
			let level = $node.node().attrs.level
			if (level <= next_item_level || $node.start() === $start!.start()) return true
			if (level > next_item_level) { $next_item_last_child = $node }
			return false
		})
		let next_last_child_is_direct_prev = $next_item_last_child && $direct_next.start() === $next_item_last_child.start()
		if (next_last_child_is_direct_prev) {
			insert_below = true
		}

		if ($next_item_last_child) {
			$next_item = $next_item_last_child
		} else {
			insert_below = true
		}
	}

	let tr = state.tr
	let sel_start_offset = from - $start.start()
	let sel_end_offset = to - $start.start()
	let items = state.doc.cut($start.start() - 1, $end.end() + 1)
	let insert_point = insert_below ? $next_item.end() : $next_item.start() - 2
	tr.insert(insert_point, items)
	tr.setSelection(TextSelection.create(tr.doc,
			insert_point + sel_start_offset + 2,
			insert_point + sel_end_offset + 2,
	))
	tr.delete($start.start() - 1, $end.end() + 1)
	closeHistory(tr)
	dispatch(tr)
	return true
}

