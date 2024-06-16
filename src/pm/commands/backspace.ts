import type { Command } from "@tiptap/core"
import { Selection } from "prosemirror-state"


export const backspace = () =>
	(): Command =>
		({ state, tr, commands, dispatch }) => {
			const { from, to, $from } = state.selection

			if (from === to) {
				// we're at the start of a block an must "joinBackwards"
				if ($from.start() === from) {
					const newFrom = Selection.findFrom(state.doc.resolve(from - 1), -1, true)
					if (!newFrom) return false
					if (dispatch) tr.delete(newFrom.from, to + 1)
					return true
				} else {
					if (dispatch) tr.delete(from - 1, to)
					return true
				}
			} else {
				return commands.deleteSelection()
			}
		}
