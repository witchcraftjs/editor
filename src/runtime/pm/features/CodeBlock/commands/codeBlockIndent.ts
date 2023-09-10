import type { Command } from "@tiptap/core"
import { TextSelection } from "@tiptap/pm/state"

declare module "@tiptap/core" {

	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		codeBlockIndent: {
			codeBlockIndent: () => ReturnType
		}
	}
}

export const codeBlockIndent = (
	codeBlockType: string
) => (): Command =>
	({ state, tr, dispatch }) => {
		const { $from, $to, empty, from, to } = state.selection.map(tr.doc, tr.mapping)

		if ($from.parent.type.name !== codeBlockType || $to.parent.type.name !== codeBlockType || $from.parent !== $to.parent) {
			return false
		}
		if (!dispatch) return true

		if (empty) {
			tr.insertText("\t")
			return true
		}

		const textContent = $from.parent.textContent
		const nodeStart = $from.start()
		let start = from - nodeStart
		let end = to - nodeStart

		// shift the start/ends to capture the start/end of the lines
		for (let i = start; i > 0; i--) {
			if (textContent[i - 1] === "\n") {
				break
			}
			start--
		}

		for (let j = end; j < textContent.length; j++) {
			if (textContent[j] === "\n") {
				break
			}
			end++
		}

		const blockSelection = textContent.slice(start, end)
		const lines = blockSelection.split("\n")
		// count the number of tabs we will be adding
		// so we know how much to move the end of the selection
		let tabCount = 0

		for (let i = 0; i < lines.length; i++) {
			lines[i] = `\t${lines[i]}`
			tabCount++
		}
		const content = lines.join("\n")
		tr.insertText(content, nodeStart + start, nodeStart + end)

		// +1 for the start tab, this is already included in tabCount
		tr.setSelection(TextSelection.create(tr.doc, from + 1, to + tabCount))

		return true
	}
