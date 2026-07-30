import { type Node, NodeType } from "@tiptap/pm/model"

import { isPartiallyEqual } from "./isPartiallyEqual"
/**
 * Returns the position of the first node matching the given parameters.
 */
export function posByNode(
	doc: Node,
	{ textContent, attrs, type, insert, after }: {
		textContent?: string
		attrs?: Record<string, any>
		type?: string | NodeType
		insert?: boolean
		after?: boolean
	}
): number {
	const insertPos = !!insert
	let posWanted: number | undefined
	const nodeType = type instanceof NodeType ? type.name : type
	doc.nodesBetween(0, doc.nodeSize - 2, (node, pos) => {
		if (posWanted === undefined) {
			if (!type || node.type.name === nodeType) {
				if (textContent === undefined || node.textContent === textContent) {
					if (!attrs || isPartiallyEqual(node.attrs, attrs, { log: false })) {
						posWanted = pos
						return false
					}
				}
			}
		}
		return true
	})
	if (posWanted === undefined) {
		try {
			// the query might not be json serializable
			throw new Error(`posWanted is undefined: ${JSON.stringify({ textContent, attrs, type: nodeType })}`)
		} catch (e) {
			throw new Error(`posWanted is undefined: ${textContent}, ${Object.keys(attrs ?? {}).join(",")}, ${nodeType}`, { cause: e })
		}
	}
	if (insertPos) {
		const node = doc.nodeAt(posWanted)
		if (node && node.inlineContent) {
			return posWanted + 1 + node.textContent.length
		}
	}
	if (after) {
		return posWanted + (doc.nodeAt(posWanted)?.nodeSize ?? 0)
	}
	return posWanted
}
