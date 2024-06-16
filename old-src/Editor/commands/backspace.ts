import { EditorState, Selection } from "prosemirror-state"

import type { Dispatch } from "@/components/Editor/types"


export const backspace = (state: EditorState, dispatch: Dispatch): boolean => {
	let tr = state.tr
	let { from, to, $from } = state.selection

	if (from === to && $from.start() === from) { // "join backwards"
		from -= 1
		let new_from = Selection.findFrom(state.doc.resolve(from), -1, true)
		if (!new_from) return false
		from = new_from.from
		tr.delete(from, to)
		dispatch(tr)
		return true
	}
	return false
}
