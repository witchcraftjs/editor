import type { NodeType, ResolvedPos } from "prosemirror-model"
import type { EditorState } from "prosemirror-state"

import { find_next } from "./find_next"
import { find_prev } from "./find_prev"
import { find_up } from "./find_up"

import { EqualSelection, NEXT, PREV, SELF } from "@/components/Editor/types"


/**
 */
export function find_equal_level_nodes(doc: EditorState["doc"], range: { $from: ResolvedPos, $to: ResolvedPos }, type: NodeType): EqualSelection {
	let { $from, $to } = range
	let $new_from = find_up(doc, $from, { start: SELF }, $node => $node.node().type === type)
	let $new_to = find_up(doc, $to, { start: SELF }, $node => $node.node().type === type)
	if (!$new_to || !$new_from) return { $start: undefined, $end: undefined }
	$from = $new_from; $to = $new_to

	let min_level = $from.node().attrs.level as number
	doc.nodesBetween($from.start(), $to.end(), node => {
		if (node.type === type) {
			let level = node.attrs.level
			if (level < min_level) min_level = level
		}
	})

	let from_node = $from.node()
	let from_level = from_node.attrs.level

	if (from_level > min_level) {
		let $prev = find_prev(doc, $from, { start: PREV }, $node => $node.node().attrs.level === min_level)
		if (!$prev) throw new Error("should never happen")
		$from = $prev
		from_node = $from.node()
		from_level = from_node.attrs.level
	}
	let last_child_level = min_level + 1

	find_next(doc, $to, { start: NEXT }, $node => {
		let node_level = $node.node().attrs.level
		if (node_level > last_child_level || (from_level !== last_child_level && node_level === last_child_level)) {
			$to = $node
		} else return true
		return false
	})
	return { $start: $from, $end: $to }
}
