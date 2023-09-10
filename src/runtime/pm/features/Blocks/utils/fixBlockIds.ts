import type { NodeType } from "@tiptap/pm/model"
import type { Transaction } from "@tiptap/pm/state"
import { nanoid } from "nanoid"

import { isValidId } from "./isValidId.js"

/** Ensures no block ids are missing, duplicated, or invalid. If no id length is given, any id length is valid. */
export function fixBlockIds(tr: Transaction, type: NodeType, idLength: number, allowOtherIdLengths: boolean = false): Transaction {
	const seen = new Set<string>()
	tr.doc.descendants((node, pos) => {
		if (node.type === type) {
			const isValid = isValidId(
				node.attrs.blockId,
				allowOtherIdLengths ? undefined : idLength
			)
			if (!isValid || seen.has(node.attrs.blockId)) {
				const blockId = nanoid(idLength)
				tr.setNodeAttribute(pos, "blockId", blockId)
				seen.add(blockId)
			} else {
				seen.add(node.attrs.blockId)
			}
		}
	})
	tr.setMeta("preventClearDocument", true)
	tr.setMeta("addToHistory", false)
	return tr
}
