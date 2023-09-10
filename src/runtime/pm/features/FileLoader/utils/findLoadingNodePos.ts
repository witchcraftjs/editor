import type { EditorState } from "@tiptap/pm/state"

export function findLoadingNodePos(
	state: EditorState,
	loadingId: string
): number | undefined {
	let replacePos
	state.doc.nodesBetween(0, state.doc.content.size - 1, (node, position) => {
		if (node.attrs.loadingId === loadingId) {
			replacePos = position
			return false
		}
		return true
	})
	return replacePos
}
