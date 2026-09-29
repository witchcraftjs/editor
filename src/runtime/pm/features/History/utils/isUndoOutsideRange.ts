import type { EditorState, Transaction } from "@tiptap/pm/state"

import { getDiffReplacementRange } from "../../../utils/getDiffReplacementRange.js"
import type { EmbedId } from "../../DocumentApi/types.js"
import { getStateEmbedRange } from "../../DocumentApi/utils/getStateEmbedRange.js"

export function isUndoOutsideRange(
	stateBefore: EditorState,
	tr: Transaction,
	embedId: EmbedId
): boolean {
	const diff = getDiffReplacementRange(stateBefore.doc, tr.doc)
	const beforeRange = getStateEmbedRange(stateBefore.doc, embedId)
	const afterRange = getStateEmbedRange(tr.doc, embedId)
	return !!(diff && beforeRange.start !== undefined && beforeRange.end !== undefined
		&& afterRange.start !== undefined && afterRange.end !== undefined
		&& (
			diff.start < beforeRange.start || diff.end > beforeRange.end
			|| diff.start < afterRange.start || diff.sliceEnd > afterRange.end
		))
}
