import { closeHistory } from "prosemirror-history"
import type { NodeType } from "prosemirror-model"
import type { Command } from "prosemirror-state"
import { SELF } from "src/types.js"
import { findNext } from "src/utils/findNext.js"
import { findUp } from "src/utils/findUp.js"


export const sinkList = (type: NodeType): Command => (state, dispatch) => {
	const { $from, $to } = state.selection
	const $fromItem = findUp(state.doc, $from, { start: SELF }, $node => $node.node().type === type)
	const $toItem = findUp(state.doc, $to, { start: SELF }, $node => $node.node().type === type)
	if (!$toItem || !$fromItem) return false

	const prevPos = $fromItem.start() - 2
	if (prevPos <= 2) return false
	const $prevItem = state.doc.resolve(prevPos)
	if (!$prevItem) return false
	if ($prevItem.node().attrs.level < $fromItem.node().attrs.level) return false

	const tr = state.tr
	let stopMarking = false
	let lastLevel!: number

	findNext(state.doc, $fromItem, { start: SELF }, $node => {
		const pos = $node.pos
		const attrs = $node.node().attrs
		const level: number = attrs.level
		if (!stopMarking) {
			tr.setNodeMarkup($node.pos - 1, undefined, { ...attrs, level: level + 1 })
		} else {
			if (level > lastLevel) {
				tr.setNodeMarkup($node.pos - 1, undefined, { ...attrs, level: level + 1 })
			} else {
				return true
			}
		}
		if (pos === $toItem!.pos) {
			stopMarking = true
			lastLevel = level
		}
		return false
	})
	closeHistory(tr)
	dispatch?.(tr)
	return true
}
