import { closeHistory } from "prosemirror-history"
import type { NodeType, ResolvedPos } from "prosemirror-model"
import { type Command, TextSelection } from "prosemirror-state"
import { NEXT } from "src/types.js"
import { findEqualLevelNodes } from "src/utils/findEqualLevelNodes.js"
import { findNext } from "src/utils/findNext.js"

/**
 * Move a list item down.
 * Optionally force selection to conform to depths (more content will be moved if necessary to not create instance where items might be more than 1 level away from their parents)
 */
export const moveListDown = (item: NodeType): Command => (state, dispatch) => {
	const { from, to } = state.selection
	const { $start, $end } = findEqualLevelNodes(state.doc, state.selection, item)
	if (!$start || !$end) return false
	const startNode = $start.node()

	const directNextPos = $end.end() + 2
	if (directNextPos >= state.doc.nodeSize - 2) return false
	const $directNext = state.doc.resolve(directNextPos)

	let insertBelow = true
	let $nextItem = findNext(state.doc, $end, { start: NEXT }, $node => {
		const node = $node.node()
		if (node.type !== item) return false
		const isSameLevel = node.attrs.level === startNode.attrs.level
		const isLevelAbove = node.attrs.level === startNode.attrs.level - 1
		const isWayAbove = node.attrs.level < startNode.attrs.level - 1

		if (isWayAbove) {
			insertBelow = false
			return false
		} else if (isSameLevel || isLevelAbove) {
			if (isLevelAbove) {
				insertBelow = true
			}
			return true
		}
		return false
	})

	if (!$nextItem) return false
	const nextItemLevel = $nextItem.node().attrs.level

	if (insertBelow && nextItemLevel === startNode.attrs.level) {
		let $nextItemLastChild: ResolvedPos | undefined

		findNext(state.doc, $nextItem, { start: NEXT }, $node => {
			const level = $node.node().attrs.level
			if (level <= nextItemLevel || $node.start() === $start!.start()) return true
			if (level > nextItemLevel) { $nextItemLastChild = $node }
			return false
		})
		const nextLastChildIsDirectPrev = $nextItemLastChild && $directNext.start() === $nextItemLastChild.start()
		if (nextLastChildIsDirectPrev) {
			insertBelow = true
		}

		if ($nextItemLastChild) {
			$nextItem = $nextItemLastChild
		} else {
			insertBelow = true
		}
	}

	const tr = state.tr
	const selStartOffset = from - $start.start()
	const selEndOffset = to - $start.start()
	const items = state.doc.cut($start.start() - 1, $end.end() + 1)
	const insertPoint = insertBelow ? $nextItem.end() : $nextItem.start() - 2
	tr.insert(insertPoint, items)
	tr.setSelection(TextSelection.create(tr.doc,
			insertPoint + selStartOffset + 2,
			insertPoint + selEndOffset + 2,
	))
	tr.delete($start.start() - 1, $end.end() + 1)
	closeHistory(tr)
	dispatch?.(tr)
	return true
}

