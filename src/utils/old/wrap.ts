import { type Node, NodeType } from "prosemirror-model"


export function wrap(node: Node | undefined, types: ({ attrs: Record<string, any>, type: NodeType } | NodeType)[], repeat: number = 1): Node {
	types = types.reverse()
	let last = node ?? []
	if (node === undefined) {repeat++}
	for (let i = 0; i < repeat; i++) {
		for (const entry of types) {
			const type = entry instanceof NodeType ? entry : entry.type
			const attrs = entry instanceof NodeType ? undefined : entry.attrs
			last = type.create(attrs, last)
		}
	}
	return last as Node
}
