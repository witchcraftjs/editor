import type { Command } from "@tiptap/core"
import { TextSelection } from "@tiptap/pm/state"

declare module "@tiptap/core" {

	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		codeBlockUnindent: {
			codeBlockUnindent: () => ReturnType
		}
	}
}

export const codeBlockUnindent = (
	codeBlockType: string
) => (): Command =>
	({ state, tr, dispatch }) => {
		const { $from, $to, from, to } = state.selection.map(tr.doc, tr.mapping)

		if ($from.parent.type.name !== codeBlockType || $to.parent.type.name !== codeBlockType || $from.parent !== $to.parent) {
			return false
		}
		if (!dispatch) return true

		const textContent = $from.parent.textContent
		const nodeStart = $from.start()
		let start = from - nodeStart
		let end = to - nodeStart

		const lastCharIsNewline = textContent[end - 1] === "\n"
		const nextCharIsTab = textContent[end] === "\t"

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
		let tabCount = 0
		let firstLineHadTab = false
		for (let i = 0; i < lines.length; i++) {
			if (lines[i].startsWith("\t")) {
				lines[i] = lines[i].slice(1)
				tabCount++
				if (i === 0) {
					firstLineHadTab = true
				}
			}
		}
		const content = lines.join("\n")
		tr.insertText(content, nodeStart + start, nodeStart + end)

		tr.setSelection(TextSelection.create(
			tr.doc,
			from - (firstLineHadTab ? 1 : 0),
			// there's a weird bug? when the cursor ends at a newline (and is technically on that line and block selecting it) and the next char is a tab
			// where you can't keep unindenting the last line
			// this grows the selection to workaround it
			to - tabCount + (lastCharIsNewline && nextCharIsTab ? 1 : 0)
		))

		return true
	}
