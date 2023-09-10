import { closeHistory } from "prosemirror-history"
import type { NodeType, ResolvedPos } from "prosemirror-model"
import { type Command, TextSelection } from "prosemirror-state"
import { findEqualLevelNodes } from "src/utils/findEqualLevelNodes.js"
import { findNext } from "src/utils/findNext.js"
import { findPrev } from "src/utils/findPrev.js"

import { NEXT, PREV } from "../types.js"

/**
 * Move a list item up.
 * Optionally force selection to conform to depths (more content will be moved if necessary to not create instance where items might be more than 1 level away from their parents)
 */
export const moveListUp = (item: NodeType): Command => (state, dispatch) => {
	const { from, to } = state.selection
	const { $start, $end } = findEqualLevelNodes(state.doc, state.selection, item)
	if (!$start || !$end) return false
	const startNode = $start.node()

	const directPrevPos = $start.start() - 2
	if (directPrevPos <= 2) return false
	const $directPrev = state.doc.resolve(directPrevPos)

	let insertBelow = false
	let $prevItem = findPrev(state.doc, $start, { start: PREV }, $node => {
		const node = $node.node()
		if (node.type !== item) return false
		const isSameLevel = node.attrs.level === startNode.attrs.level
		const isLevelAbove = node.attrs.level === startNode.attrs.level - 1
		const isWayAbove = node.attrs.level < startNode.attrs.level - 1

		if (isWayAbove) {
			insertBelow = true
			return false
		} else if (isSameLevel || isLevelAbove) {
			if (isLevelAbove) {
				// ignore the parent if it's the first child
				if ($node.start() === $directPrev.start()) {
					insertBelow = true
					return false
				}
			}
			return true
		}
		return false
	})
	if (!$prevItem) return false
	const prevItemLevel = $prevItem.node().attrs.level

	if (insertBelow) {
		let $prevItemLastChild: ResolvedPos | undefined

		findNext(state.doc, $prevItem, { start: NEXT }, $node => {
			const level = $node.node().attrs.level
			if (level <= prevItemLevel || $node.start() === $start!.start()) return true
			if (level > prevItemLevel) {$prevItemLastChild = $node}
			return false
		})
		const prevLastChildIsDirectPrev = $prevItemLastChild && $directPrev.start() === $prevItemLastChild.start()
		if (prevLastChildIsDirectPrev) {
			insertBelow = true
		}

		if ($prevItemLastChild) {
			$prevItem = $prevItemLastChild
		} else {
			insertBelow = true
		}
	}


	const tr = state.tr
	const selStartOffset = from - $start.start()
	const selEndOffset = to - $start.start()
	const items = state.doc.cut($start.start() - 1, $end.end() + 1)

	tr.delete($start.start() - 1, $end.end())
	const insertPoint = insertBelow ? $prevItem.end() : $prevItem.start() - 2

	tr.insert(insertPoint, items)

	tr.setSelection(TextSelection.create(tr.doc,
			insertPoint + selStartOffset + 2,
			insertPoint + selEndOffset + 2,
	))
	closeHistory(tr)
	dispatch?.(tr)
	return true
}

