import type { NodeType, ResolvedPos } from "prosemirror-model"
import type { Transaction } from "prosemirror-state"

import { nodes_between } from "./nodes_between"
import { set_attrs } from "./set_attrs"


export function set_attrs_between(
	tr: Transaction,
	$from: ResolvedPos,
	$to: ResolvedPos,
	type: NodeType,
	attrs: Record<string, any>,
	{ descend = false }: { descend?: boolean } = {},
): void {
	nodes_between(tr, $from, $to, (node, pos) => {
		if (node.type === type) {
			set_attrs(tr, tr.doc.resolve(pos), attrs)
			return descend
		} else return true
	})
}
