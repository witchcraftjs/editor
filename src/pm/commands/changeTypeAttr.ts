import type { Command } from "@tiptap/core"

import type { CommandAttributeOptions } from "../../types.js"
import { nodesBetween } from "../utils/nodesBetween.js"


export const changeTypeAttr = ({
	nodeType,
	allowedValues,
	attributeKey,
	shift = -1,
}: CommandAttributeOptions<string>) =>
	({
		type,
	}: { type: string }): Command =>
		({ state, tr, dispatch }) => {
			if (!allowedValues.includes(type)) { return false }
			let changed = false
			nodesBetween(tr.doc, state.selection, { shift }, (node, pos) => {
				if (node?.type === nodeType) {
					changed = true
					if (dispatch) {
						tr.setNodeAttribute(pos, attributeKey, type)
					}
				}
				return true
			})
			if (!changed) return false
			return true
		}
