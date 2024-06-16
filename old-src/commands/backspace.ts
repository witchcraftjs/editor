import { type Command, Selection } from "prosemirror-state"


export const backspace: Command = (state, dispatch) => {
	const tr = state.tr
	const sel = state.selection
	let from = sel.from

	if (from === sel.to && sel.$from.start() === from) { // "join backwards"
		from -= 1
		const newFrom = Selection.findFrom(state.doc.resolve(from), -1, true)
		if (!newFrom) return false
		from = newFrom.from
		tr.delete(from, sel.to)
		dispatch?.(tr)
		return true
	}
	return false
}
