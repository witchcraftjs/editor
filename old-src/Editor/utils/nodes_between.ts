import type { ResolvedPos } from "prosemirror-model"
import type { EditorState, Transaction } from "prosemirror-state"

import type { NodesBetweenFilter } from "@/components/Editor/types"

/**
 * A more intuitive nodesBetween wrapper. Goes only through the nodes starting at $from and ending at $to.
 * Does not go through wrapping parents that start/end before/after the given positions like nodesBetween.
 */
export function nodes_between(tr: EditorState | Transaction, $from: ResolvedPos, $to: ResolvedPos, filter: NodesBetweenFilter): void {
	let start_pos = $from.start()
	let slice = tr.doc.slice($from.start() - 1, $to.end() + 1)
	slice.content.nodesBetween(0, slice.size, (node, pos, ...args) => filter(node, start_pos + pos, ...args))
}
