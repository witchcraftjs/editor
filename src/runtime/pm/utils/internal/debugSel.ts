/* eslint-disable no-console */
import { EditorState } from "@tiptap/pm/state"

export function debugSel(sel: EditorState | { from: number, to: number }, title: string | number = ""): void {
	if (sel instanceof EditorState) {
		console.log(title, sel.selection.from, sel.selection.to)
	} else {
		console.log(title, sel.from, sel.to)
	}
}
