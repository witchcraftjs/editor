/* eslint-disable no-console */
/* eslint-disable no-unreachable */
/* eslint-disable no-inner-declarations */
import { closeHistory } from "prosemirror-history"
import type { NodeType, ResolvedPos } from "prosemirror-model"
import { EditorState, TextSelection } from "prosemirror-state"

import { Command, Dispatch, NEXT, PREV } from "@/components/Editor/types"
import { find_equal_level_nodes, find_next, find_prev } from "@/components/Editor/utils/"

/**
 * Move a list item up.
 * Optionally force selection to conform to depths (more content will be moved if necessary to not create instance where items might be more than 1 level away from their parents)
 */
export const move_list_up = (item: NodeType): Command => (state: EditorState, dispatch: Dispatch): boolean => {
	let { from, to } = state.selection
	let { $start, $end } = find_equal_level_nodes(state.doc, state.selection, item)
	if (!$start || !$end) return false
	let start_node = $start.node()

	let direct_prev_pos = $start.start() - 2
	if (direct_prev_pos <= 2) return false
	let $direct_prev = state.doc.resolve(direct_prev_pos)

	let insert_below = false
	let $prev_item = find_prev(state.doc, $start, { start: PREV }, $node => {
		let node = $node.node()
		if (node.type !== item) return false
		let is_same_level = node.attrs.level === start_node.attrs.level
		let is_level_above = node.attrs.level === start_node.attrs.level - 1
		let is_way_above = node.attrs.level < start_node.attrs.level - 1

		if (is_way_above) {
			insert_below = true
			return false
		} else if (is_same_level || is_level_above) {
			if (is_level_above) {
				// ignore the parent if it's the first child
				if ($node.start() === $direct_prev.start()) {
					insert_below = true
					return false
				}
			}
			return true
		}
		return false
	})
	if (!$prev_item) return false
	let prev_item_level = $prev_item.node().attrs.level

	if (insert_below) {
		let $prev_item_last_child: ResolvedPos | undefined

		find_next(state.doc, $prev_item, { start: NEXT }, $node => {
			let level = $node.node().attrs.level
			if (level <= prev_item_level || $node.start() === $start!.start()) return true
			if (level > prev_item_level) {$prev_item_last_child = $node}
			return false
		})
		let prev_last_child_is_direct_prev = $prev_item_last_child && $direct_prev.start() === $prev_item_last_child.start()
		if (prev_last_child_is_direct_prev) {
			insert_below = true
		}

		if ($prev_item_last_child) {
			$prev_item = $prev_item_last_child
		} else {
			insert_below = true
		}
	}


	let tr = state.tr
	let sel_start_offset = from - $start.start()
	let sel_end_offset = to - $start.start()
	let items = state.doc.cut($start.start() - 1, $end.end() + 1)

	tr.delete($start.start() - 1, $end.end())
	let insert_point = insert_below ? $prev_item.end() : $prev_item.start() - 2

	tr.insert(insert_point, items)

	tr.setSelection(TextSelection.create(tr.doc,
			insert_point + sel_start_offset + 2,
			insert_point + sel_end_offset + 2,
	))
	closeHistory(tr)
	dispatch(tr)
	return true
}

