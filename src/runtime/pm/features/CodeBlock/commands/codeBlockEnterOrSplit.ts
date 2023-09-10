import type { Command } from "@tiptap/core"

declare module "@tiptap/core" {

	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		codeBlockEnterOrSplit: {
			codeBlockEnterOrSplit: (pos?: number) => ReturnType
		}
	}
}

export const codeBlockEnterOrSplit = (
	codeBlockType: string
) => (pos?: number): Command =>
	({ state, chain, tr }) => {
		const sel = state.selection.map(tr.doc, tr.mapping)
		const { $from, $to } = sel
		let { empty, from } = sel
		if (pos !== undefined) {
			from = pos
			empty = true
		}

		if ($from.parent.type.name !== codeBlockType || $to.parent.type.name !== codeBlockType || $from.parent !== $to.parent) {
			return false
		}

		const isAtEnd = empty && from === $from.end()
		const endsWithDoubleNewline = $from.parent.textContent.endsWith("\n\n")

		if (isAtEnd && endsWithDoubleNewline) {
			return chain()

				.command(({ tr, dispatch }) => {
					// Delete the two empty lines at the end
					if (dispatch) {
						tr.delete(from - 1, $from.pos)
					}
					return true
				})
				.splitItem()
				.run()
		}

		return chain()
			.command(({ commands }) => {
				if (!empty) {
					return commands.deleteSelection()
				}
				return true
			})
			.newlineInCode()
			.run()
	}
