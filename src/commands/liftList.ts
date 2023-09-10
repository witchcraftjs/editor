import { closeHistory } from "prosemirror-history"
import type { NodeType } from "prosemirror-model"
import type { Command } from "prosemirror-state"
import { SELF } from "src/types.js"
import { findNext } from "src/utils/findNext.js"
import { findUp } from "src/utils/findUp.js"


export const liftList = (type: NodeType): Command => (state, dispatch) => {
	const { $from, $to } = state.selection
	const $fromItem = findUp(state.doc, $from, { start: SELF }, $node => $node.node().type === type)
	const $toItem = findUp(state.doc, $to, { start: SELF }, $node => $node.node().type === type)
	if (!$toItem || !$fromItem) return false

	const tr = state.tr
	let stopMarking = false
	let lastLevel!: number
	findNext(state.doc, $fromItem, { start: SELF }, $node => {
		const pos = $node.pos
		const attrs = $node.node().attrs
		const level = attrs.level
		if (!stopMarking) {
			tr.setNodeMarkup($node.pos - 1, undefined, { ...attrs, level: level > 1 ? level - 1 : 0 })
		} else {
			if (level > lastLevel) {
				tr.setNodeMarkup($node.pos - 1, undefined, { ...attrs, level: level > 1 ? level - 1 : 0 })
			} else {
				return true
			}
		}
		if (pos === $toItem!.pos) {
			stopMarking = true
			lastLevel = level
			if (lastLevel === 0) return true
		}
		return false
	})
	closeHistory(tr)
	dispatch?.(tr)
	return true
}
