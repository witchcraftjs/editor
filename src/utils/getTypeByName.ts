import type { NodeType, Schema } from "prosemirror-model"


export	const getTypeByName = (schema: Schema, name: string): NodeType => {
	const nodeType = schema.nodes[name]
	if (nodeType === undefined || nodeType === null) throw new Error(`Unknown node type:${name}`)
	return nodeType
}
