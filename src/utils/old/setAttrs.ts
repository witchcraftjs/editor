import type { ResolvedPos } from "prosemirror-model"
import type { Transaction } from "prosemirror-state"


export function setAttrs(tr: Transaction, $node: ResolvedPos, attrs: Record<string, any>): void {
	const node = $node.node()
	return tr.setNodeMarkup($node.start() - 1, undefined, { ...node.attrs, ...attrs }, node.marks)
}
