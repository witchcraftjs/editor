import { Node } from "@tiptap/core"

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Document = Node.create({
	name: "doc" satisfies NodeDocumentName,
	topNode: true,
	content: "list"
})
export type NodeDocumentName = "doc"
