import type { NodeType, ResolvedPos } from "prosemirror-model"
import type { Transaction } from "prosemirror-state"

import { nodesBetween } from "./nodesBetween.js"
import { setAttrs } from "./setAttrs.js"


export function setattrsBetween(
	tr: Transaction,
	$from: ResolvedPos,
	$to: ResolvedPos,
	type: NodeType,
	attrs: Record<string, any>,
	{ descend = false }: { descend?: boolean } = {},
): void {
	nodesBetween(tr, $from, $to, (node, pos) => {
		if (node?.type === type) {
			setAttrs(tr, tr.doc.resolve(pos), attrs)
			return descend
		} else return true
	})
}
