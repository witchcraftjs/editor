/*
 * Adapted from @tiptap/y-tiptap's restoreRelativeSelection (https://github.com/tiptap/y-tiptap).
 * Same selection-type-aware shape ({type, depth, anchor, head}) and the same safe node/nodeRange reconstruction as upstream.
 * getRelativeSelection is imported from @tiptap/y-tiptap directly at the call sites (upstream exports it); only restoreRelativeSelection is kept local because upstream does not export it.
 */
import { AllSelection, NodeSelection, Selection, TextSelection, type Transaction } from "@tiptap/pm/state"
import { type ProsemirrorBinding, relativePositionToAbsolutePosition } from "@tiptap/y-tiptap"
import type * as Y from "yjs"

import type { RelativeSelection } from "../types.js"

/** Safely reconstruct a NodeSelection at an absolute position, falling back to the nearest text selection. */
function createSafeNodeSelection(tr: Transaction, pos: number): Selection {
	const $pos = tr.doc.resolve(pos)
	if ($pos.nodeAfter) {
		return NodeSelection.create(tr.doc, pos)
	} else {
		return TextSelection.near($pos)
	}
}

/** Safely reconstruct a NodeRangeSelection from resolved absolute positions, falling back to the nearest text selection. */
function createSafeNodeRangeSelection(tr: Transaction, anchor: number | null, head: number | null, depth?: number): Selection | null {
	if (anchor === null || head === null) {
		return null
	}
	const clampedAnchor = Math.min(Math.max(anchor, 0), tr.doc.content.size)
	const clampedHead = Math.min(Math.max(head, 0), tr.doc.content.size)
	try {
		const selection = Selection.fromJSON(tr.doc, {
			type: "nodeRange",
			anchor: clampedAnchor,
			head: clampedHead,
			depth
		}) as Selection
		if (!selection.ranges.length) {
			return TextSelection.near(tr.doc.resolve(clampedAnchor))
		}
		return selection
	} catch {
		return TextSelection.near(tr.doc.resolve(clampedAnchor))
	}
}

/**
 * Restore a previously captured relative selection onto a transaction.
 * No-op if the selection can't be resolved (e.g. deleted content).
 */
export function restoreRelativeSelection(
	tr: Transaction,
	relSel: RelativeSelection | null,
	binding: ProsemirrorBinding
): void {
	if (!relSel || relSel.anchor === null || relSel.head === null) return

	if (relSel.type === "all") {
		tr.setSelection(new AllSelection(tr.doc))
		return
	}

	const anchor = relativePositionToAbsolutePosition(binding.doc as Y.Doc, binding.type, relSel.anchor, binding.mapping)
	const head = relativePositionToAbsolutePosition(binding.doc as Y.Doc, binding.type, relSel.head, binding.mapping)

	if (relSel.type === "node") {
		// anchor is null when the referenced node was deleted or moved out of
		// binding.type by a remote update; resolving null would throw.
		if (anchor !== null) {
			tr.setSelection(createSafeNodeSelection(tr, anchor))
		}
	} else if (relSel.type === "nodeRange") {
		const selection = createSafeNodeRangeSelection(tr, anchor, head, relSel.depth)
		if (selection !== null) {
			tr.setSelection(selection)
		}
	} else {
		if (anchor !== null && head !== null) {
			tr.setSelection(TextSelection.between(tr.doc.resolve(anchor), tr.doc.resolve(head)))
		}
	}
}
