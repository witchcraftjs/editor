import type { Command } from "@tiptap/core"

import type { CommandAttributeOptions } from "../../../../types/index.js"
import { findUpwards } from "../../../utils/findUpwards.js"
import type { StatefulNodeStates } from "../types.js"

declare module "@tiptap/core" {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		changeItemType: {
			changeItemType: (opts: {
				type: string
				state?: string
			}, pos?: number) => ReturnType
		}
	}
}

export const changeItemType = ({
	nodeType,
	allowedValues,
	allowedStates,
	stateAttributeKey,
	attributeKey
}:
	CommandAttributeOptions<string> & {
		allowedStates: StatefulNodeStates
		stateAttributeKey: string
	}) =>
	({
		type,
		state: itemState
	}: {
		type: string
		state?: string
	}, pos?: number): Command =>
		({ state, tr, dispatch }) => {
			if (!allowedValues.includes(type)) { return false }
			const position = pos ?? state.selection.map(tr.doc, tr.mapping).from
			const $item = findUpwards(tr.doc, position, $pos => {
				if ($pos.node().type.name === nodeType) {
					return true
				}
				return false
			})?.$pos
			if ($item) {
				const finalPos = $item.pos
				const node = $item.node()
				if (dispatch) {
					tr.setNodeAttribute(finalPos - 1, attributeKey, type)
					if (type.startsWith("stateful-")) {
						const statefulType = type.slice(type.indexOf("-") + 1)
						const stateEntry = allowedStates[statefulType]
						if (stateEntry !== undefined) {
							const newState = itemState ?? (node as any).state ?? stateEntry.default
							tr.setNodeAttribute(finalPos, stateAttributeKey, newState)
						}
					}
				} // else let it silently retain it's state ?
				return true
			} else {
				return false
			}
		}
