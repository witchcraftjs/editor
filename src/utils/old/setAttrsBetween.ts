import type { NodeType, ResolvedPos } from "prosemirror-model"
import type { Transaction } from "prosemirror-state"

import { debugNode } from "./internal/debugNode.js"
import { nodesBetween } from "./nodesBetween.js"
import { setAttrs } from "./setAttrs.js"

/**
 * Like nodesBetween, but for setting attributes on specific node types.
 *
 * Note you might need to slightly shift the $from or $to positions if they are the same, otherwise there are no nodes to go through.
 *
 * Returns an array of positions if any nodes were changed, false otherwise.
 */
export function setAttrsBetween(
	tr: Transaction,
	$from: ResolvedPos,
	$to: ResolvedPos,
	type: NodeType,
	attrs: Record<string, any>,
	{ descend = false }: { descend?: boolean } = {},
): false | number[] {
	const changed: number[] = []
	nodesBetween(tr, $from, $to, (node, pos) => {
		if (node?.type === type) {
			setAttrs(tr, tr.doc.resolve(pos), attrs)
			changed.push(pos)
			return descend
		} else return true
	})
	return changed.length === 0 ? false : changed
}
