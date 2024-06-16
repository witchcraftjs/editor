import type { Command } from "@tiptap/core"

import type { CommandAttributeOptions } from "../../types.js"
import type { StatefulNodeStates } from "../schema/stateful.js"
import { nodesBetween } from "../utils/nodesBetween.js"


export const changeListItemType = ({
	nodeType,
	allowedValues,
	allowedStates,
	stateAttributeKey,
	attributeKey,
	shift = -1,
}:
CommandAttributeOptions<string> & {
	allowedStates: StatefulNodeStates
	stateAttributeKey: string
}) =>
	({
		type,
		state,
	}: { type: string, state?: string }): Command =>
		({ state: editorState, tr, dispatch }) => {
			if (!allowedValues.includes(type)) { return false }
			let changed = false
			nodesBetween(tr.doc, editorState.selection, { shift }, (node, pos) => {
				if (node?.type === nodeType) {
					changed = true
					if (dispatch) {
						tr.setNodeAttribute(pos, attributeKey, type)
						if (type.startsWith("stateful-")) {
							const statefulType = type.slice(type.indexOf("-") + 1)
							const stateEntry = allowedStates[statefulType]
							if (stateEntry !== undefined) {
								const newState = state !== undefined
											? state
											// recover retained state
											: ((node as any).state ?? stateEntry.default)
								tr.setNodeAttribute(pos, stateAttributeKey, newState)
							}
						} // else let it silently retain it's state ?
					}
				}
				return true
			})
			if (!changed) return false
			return true
		}

