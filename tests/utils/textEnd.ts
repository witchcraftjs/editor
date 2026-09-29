import type { setupWrapper } from "./setupWrapper.js"

/** Returns a position inside the first paragraph where text can be inserted. */
export function textEnd(wrapper: Awaited<ReturnType<typeof setupWrapper>>): number {
	const doc = wrapper.editor.state.doc
	let paraStart = -1
	doc.descendants((node, pos) => {
		if (paraStart === -1 && node.type.name === "paragraph") paraStart = pos + 1
		return paraStart === -1
	})
	if (paraStart === -1) return doc.content.size - 1
	let end = paraStart
	doc.nodesBetween(paraStart, doc.content.size, (node, pos) => {
		if (node.isText) end = pos + node.nodeSize
	})
	return end
}
