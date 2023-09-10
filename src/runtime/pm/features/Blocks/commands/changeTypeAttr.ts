import type { Command } from "@tiptap/core"

import type { CommandAttributeOptions } from "../../../../types/index.js"
import { findUpwards } from "../../../utils/findUpwards.js"

declare module "@tiptap/core" {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		changeTypeAttr: {
			changeTypeAttr: (opts: {
				type: string
			}) => ReturnType
		}
	}
}

export const changeTypeAttr = ({
	nodeType,
	allowedValues,
	attributeKey
}: CommandAttributeOptions<string>) =>
	({
		type
	}: {
		type: string
	},
	pos?: number): Command =>
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
				if (dispatch) {
					const finalPos = $item.pos
					// not sure why the -1 is needed here...
					tr.setNodeAttribute(finalPos - 1, attributeKey, type)
				}
				return true
			} else {
				return false
			}
		}
