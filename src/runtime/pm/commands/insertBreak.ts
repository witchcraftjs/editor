import { type Command, getNodeType } from "@tiptap/core"
import { TextSelection } from "@tiptap/pm/state"

declare module "@tiptap/core" {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		insertBreak: {
			insertBreak: (pos?: number) => ReturnType
		}
	}
}

export const insertBreak = (
	codeBlockType: string = "codeBlock",
	disallowedTypesOrNames: string[] = ["blockquote"]
) => (pos?: number): Command =>
	({ state, commands, tr, dispatch }) => {
		const { $from, $to } = state.selection.map(tr.doc, tr.mapping)

		if ($from.parent.type.name === codeBlockType || $to.parent.type.name === codeBlockType) {
			// enter functions normally
			return commands.codeBlockEnterOrSplit(pos)
		}
		const disallowedTypes = disallowedTypesOrNames.map(type => getNodeType(type, state.schema))

		if (disallowedTypes.some(type => $from.node(-1)?.type === type || $to.node(-1)?.type === type)) {
			return false
		}

		if (dispatch) {
			if (pos !== undefined) {
				tr.setSelection(TextSelection.create(tr.doc, pos))
			}
			commands.setHardBreak()
			if (pos !== undefined) {
				tr.setSelection(TextSelection.create(tr.doc, tr.mapping.map(pos)))
			}
		}
		return true
	}
