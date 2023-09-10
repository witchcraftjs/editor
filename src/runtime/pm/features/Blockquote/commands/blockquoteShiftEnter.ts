import { type Command, getNodeType } from "@tiptap/core"
import type { NodeType } from "@tiptap/pm/model"

declare module "@tiptap/core" {

	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		blockquoteShiftEnter: {
			blockquoteShiftEnter: () => ReturnType
		}
	}
}
/** Allows blockquotes to have multiple paragraphs. */
export const blockquoteShiftEnter = (
	blockQuoteTypeOrName: string | NodeType
) => (): Command => ({ tr, dispatch, state }) => {
	const { $from, $to, from } = tr.selection
	const blockquoteType = getNodeType(blockQuoteTypeOrName, state.schema)
	if ($from.node(-1)?.type === blockquoteType || $to.node(-1)?.type === blockquoteType) {
		if (dispatch) {
			tr.split(from, 1)
		}
		return true
	}
	return false
}
