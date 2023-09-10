import type { Command } from "@tiptap/core"

declare module "@tiptap/core" {

	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		deleteSelection: {
			deleteSelection: () => ReturnType
		}
	}
}

export const deleteSelection = () =>
	(): Command =>
		({ state, tr, dispatch }) => {
			const { from, to } = state.selection.map(tr.doc, tr.mapping)
			if (from !== to) {
				if (dispatch) tr.delete(from, to)
				return true
			}
			return false
		}
