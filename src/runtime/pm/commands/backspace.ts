import type { Command } from "@tiptap/core"
import { Selection, TextSelection } from "@tiptap/pm/state"

import { redirectFromEmbedded } from "../features/EmbeddedDocument/utils/redirectFromEmbedded.js"

declare module "@tiptap/core" {

	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		backspace: {
			/**
			 * @redirectable
			 */
			backspace: () => ReturnType
		}
	}
}

export const backspace = () =>
	(): Command =>
		({ state, tr, commands, dispatch, view }): any => {
			const { from, to, $from } = state.selection.map(tr.doc, tr.mapping)

			if (from === to) {
				const redirect = redirectFromEmbedded(view, "backspace", { args: [], view, commands })
				if (redirect.redirected) { return redirect.result }
				// we're at the start of a block and must "joinBackwards"
				if ($from.start() === from) {
					const endsEqual = $from.end() === $from.start()
					const newFrom = Selection.findFrom(state.doc.resolve(from - 1), -1, true)
					if (!newFrom) return false
					if (dispatch) {
						tr.delete(newFrom.from, to + (endsEqual ? 2 : 0))
						tr.setSelection(new TextSelection(tr.doc.resolve(newFrom.from)))
					}
					return true
				} else {
					if (dispatch) tr.delete(from - 1, to)
					return true
				}
			} else {
				return commands.deleteSelection()
			}
		}
