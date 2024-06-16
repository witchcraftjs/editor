import { Node, NodeType } from "prosemirror-model"


export function wrap(node: Node | undefined, types: ({ attrs: Record<string, any>, type: NodeType } | NodeType)[], repeat: number = 1): Node {
	types = types.reverse()
	let last = node ?? []
	if (node === undefined) {repeat++}
	for (let i = 0; i < repeat; i++) {
		for (let entry of types) {
			let type = entry instanceof NodeType ? entry : entry.type
			let attrs = entry instanceof NodeType ? undefined : entry.attrs
			last = type.create(attrs, last)
		}
	}
	return last as Node
}
