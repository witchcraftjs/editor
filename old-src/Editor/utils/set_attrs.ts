import type { ResolvedPos } from "prosemirror-model"
import type { Transaction } from "prosemirror-state"


export function set_attrs(tr: Transaction, $node: ResolvedPos, attrs: Record<string, any>): void {
	let node = $node.node()
	tr.setNodeMarkup($node.start() - 1, undefined, { ...node.attrs, ...attrs }, node.marks)
}
