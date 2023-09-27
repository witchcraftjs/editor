import type { ResolvedPos } from "prosemirror-model"
import type { EditorState, Transaction } from "prosemirror-state"

import { debugNode } from "./internal/debugNode.js"

import { type NodesBetweenFilter } from "../types.js"
/**
 * A more intuitive nodesBetween wrapper. Goes only through the nodes starting at $from and ending at $to.
 * Does not go through wrapping parents that start/end before/after the given positions like nodesBetween.
 */
export function nodesBetween(
	tr: EditorState | Transaction,
	$from: ResolvedPos,
	$to: ResolvedPos,
	filter: NodesBetweenFilter
): void {
	const startPos = $from.start() - 1
	const slice = tr.doc.slice($from.start() - 1, $to.end() + 1)
	debugNode(slice, "", false, true, ["size", "is", "attrs"])
	slice.content.nodesBetween(0, slice.size, (node, pos, ...args) => filter(node, startPos + pos, ...args))
}
