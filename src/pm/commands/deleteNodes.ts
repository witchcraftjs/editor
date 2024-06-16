import type { Command } from "@tiptap/core"
import { TextSelection } from "prosemirror-state"


export const deleteNodes = 	() =>
	(pos?: number | undefined): Command =>
		({ state, tr, dispatch }) => {
			if (pos !== undefined) {
				const $pos = tr.doc.resolve(pos)
				const depth = $pos.node(-2).childCount === 1 ? -2 : -1
				if (dispatch) tr.delete($pos.before(depth), $pos.after(depth))
			} else {
				const { $from, $to, from } = state.selection
				const startDepth = $from.node(-2).childCount === 1 ? -2 : -1
				const endDepth = $to.node(-2).childCount === 1 ? -2 : -1
				if (dispatch) {
					tr.delete($from.before(startDepth), $to.after(endDepth))
					// move cursor to previous node
					const newCursor = tr.mapping.map(from) - 1
					tr.setSelection(TextSelection.create(tr.doc, newCursor))
				}
			}
			return true
		}
	
