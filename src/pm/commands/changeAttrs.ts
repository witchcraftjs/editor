import type { Command } from "@tiptap/core"

import type { CommandNodeOptions } from "../../types.js"
import { nodesBetween } from "../utils/nodesBetween.js"


export const changeAttrs =
	() =>
		(
			nodeType: string | undefined,
			attrs: Record<string, any>,
			shift: CommandNodeOptions["shift"] = -1
		): Command =>
			({ state, tr, dispatch }) => {
				let changed = false
				
				nodesBetween(tr.doc, state.selection, { shift }, (node, pos) => {
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
