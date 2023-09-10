import { type Command, getNodeType } from "@tiptap/core"
import type { NodeType } from "@tiptap/pm/model"
import { TextSelection } from "@tiptap/pm/state"

import { findUpwards } from "../../../utils/findUpwards.js"

declare module "@tiptap/core" {

	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		deleteNodes: {
			deleteNodes: (
				type: NodeType | string,
				pos?: number | undefined

			) => ReturnType
		}
	}
}

export const deleteNodes = () =>
	(
		type: NodeType | string,
		pos?: number | undefined
	): Command =>
		({ state, tr, dispatch }) => {
			const nodeType = getNodeType(type, state.schema)
			if (pos !== undefined) {
				const $pos = tr.doc.resolve(pos)

				const $wantedPos = findUpwards(tr.doc, pos, $pos => $pos.node().type === nodeType).$pos

				if (!$wantedPos) return false
				const depth = $wantedPos.depth - ($wantedPos.node(-1).childCount === 1 ? 1 : 0)
				if (dispatch) {
					const beforePos = $pos.before(depth)
					tr.delete(beforePos, $pos.after(depth))
				}
			} else {
				const { $from, $to, from } = state.selection.map(tr.doc, tr.mapping)
				const $wantedFrom = findUpwards(tr.doc, from, $pos => $pos.node().type === nodeType).$pos
				const $wantedTo = findUpwards(tr.doc, from, $pos => $pos.node().type === nodeType).$pos
				if (!$wantedFrom || !$wantedTo) return false
				const startDepth = $wantedFrom.depth - ($wantedFrom?.node(-1).childCount === 1 ? 1 : 0)
				const endDepth = $wantedTo.depth - ($wantedTo?.node(-1).childCount === 1 ? 1 : 0)
				if (dispatch) {
					tr.delete($from.before(startDepth), $to.after(endDepth))
					// move cursor to previous node
					const newCursor = tr.mapping.map(from) - 1
					tr.setSelection(TextSelection.near(tr.doc.resolve(newCursor), -1))
				}
			}
			return true
		}
