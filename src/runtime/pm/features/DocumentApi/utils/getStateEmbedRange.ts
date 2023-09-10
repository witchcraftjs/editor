import type { Node } from "@tiptap/pm/model"

import type { BlockId } from "../types.js"

export function getStateEmbedRange(
	doc: Node,
	blockId: BlockId
): { start: number, end: number } | { start: undefined, end: undefined } {
	const id = blockId.blockId
	let start: number | undefined
	let end: number | undefined
	doc.nodesBetween(0, doc.content.size, (node, pos) => {
		if (start === undefined && node.type.name === "item" && node.attrs.blockId === id) {
			start = pos
			end = pos + node.nodeSize
			return false
		}
		if (start !== undefined) return false
		return true
	})
	if (start === undefined || end === undefined) {
		return { start: undefined, end: undefined }
	} else {
		return { start, end }
	}
}
