import type { Node, NodeType, ResolvedPos } from "prosemirror-model"
import type { Selection } from "prosemirror-state"

import { debugNode } from "./internal/debugNode.js"
import { nodesBetween } from "./nodesBetween.js"


export const getChildChunks = (
	doc: Node,
	itemType: NodeType,
	selection: Pick<Selection, "$from" | "$to">
): Pick<Selection, "$from" | "$to">[] => {
	const children: Pick<Selection, "$from" | "$to">[] = []

	nodesBetween(doc, selection, { shift: -1 }, (node, pos) => {
		if (node?.type === itemType) {
			const $pos = doc.resolve(pos + 1)
			if ($pos.depth > selection.$from.depth) {
				children.push({ $from: $pos, $to: $pos })
				return false
			}
		}
		return true
	})
	return children
}
