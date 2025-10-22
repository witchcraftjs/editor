import type { Command } from "@tiptap/core"

import { nodesBetween } from "../utils/nodesBetween.js"

declare module "@tiptap/core" {

	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		changeAttrs: {
			changeAttrs: (
				nodeType: string | undefined,
				attrs: Record<string, unknown>
			) => ReturnType
		}
	}
}

export const changeAttrs
	= () =>
		(
			nodeType: string | undefined,
			attrs: Record<string, unknown>
		): Command =>
			({ state, tr, dispatch }) => {
				let changed = false
				nodesBetween(tr.doc, state.selection.map(tr.doc, tr.mapping), (node, pos) => {
					if (node?.type?.name === nodeType) {
						changed = true
						if (dispatch) {
							tr.setNodeMarkup(pos, undefined, attrs)
						}
					}
					return true
				})
				if (!changed) return false
				return true
			}
