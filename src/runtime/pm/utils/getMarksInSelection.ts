import type { Mark } from "@tiptap/pm/model"
import type { EditorState } from "@tiptap/pm/state"

export function getMarksInSelection(state: EditorState): Mark[] {
	const sel = state.selection
	const marks: Mark[] = []
	const isAtEnd = sel.$from.parentOffset === sel.$to.parent.nodeSize - 2
	const start = isAtEnd ? sel.from - 1 : sel.from
	const end = sel.empty ? sel.from + 1 : sel.to
	state.doc.nodesBetween(start, end, node => {
		if (node.marks) {
			for (const mark of node.marks) {
				marks.push(mark)
			}
		}
		return true
	})
	return marks
}
