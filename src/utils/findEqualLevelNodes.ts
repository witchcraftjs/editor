import type { NodeType, ResolvedPos } from "prosemirror-model"
import type { EditorState } from "prosemirror-state"

import { findNext } from "./findNext.js"
import { findPrev } from "./findPrev.js"
import { findUp } from "./findUp.js"

import { type EqualSelection, NEXT, PREV, SELF } from "../types.js"


export function findEqualLevelNodes(
	doc: EditorState["doc"],
	range: { $from: ResolvedPos, $to: ResolvedPos },
	type: NodeType
): EqualSelection {
	let { $from, $to } = range
	const $newFrom = findUp(doc, $from, { start: SELF }, $node => $node.node().type === type)
	const $newTo = findUp(doc, $to, { start: SELF }, $node => $node.node().type === type)
	if (!$newTo || !$newFrom) return { $start: undefined, $end: undefined }
	$from = $newFrom; $to = $newTo

	let minLevel = $from.node().attrs.level as number
	doc.nodesBetween($from.start(), $to.end(), node => {
		if (node.type === type) {
			const level = node.attrs.level
			if (level < minLevel) minLevel = level
		}
	})

	let fromNode = $from.node()
	let fromLevel = fromNode.attrs.level

	if (fromLevel > minLevel) {
		const $prev = findPrev(doc, $from, { start: PREV }, $node => $node.node().attrs.level === minLevel)
		if (!$prev) throw new Error("should never happen")
		$from = $prev
		fromNode = $from.node()
		fromLevel = fromNode.attrs.level
	}
	const lastChildLevel = minLevel + 1

	findNext(doc, $to, { start: NEXT }, $node => {
		const nodeLevel = $node.node().attrs.level
		if (nodeLevel > lastChildLevel || (fromLevel !== lastChildLevel && nodeLevel === lastChildLevel)) {
			$to = $node
		} else return true
		return false
	})
	return { $start: $from, $end: $to }
}
