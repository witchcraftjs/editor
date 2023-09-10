import { type Command, getNodeType } from "@tiptap/core"
import type { NodeType } from "@tiptap/pm/model"
import { TextSelection } from "@tiptap/pm/state"

declare module "@tiptap/core" {

	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		blockquoteEnter: {
			blockquoteEnter: (pos?: number) => ReturnType
		}
	}
}
/** Allows blockquotes enter to work if possible, otherwise fallsback to creating and focusing a new node of the given fallback type after the blockquote containing item. */
export const blockquoteEnter = (
	blockQuoteTypeOrName: string | NodeType,
	citationTypeOrName: string | NodeType = "cite",
	fallbackNodeTypeOrName: string | NodeType = "item"
) => (pos?: number): Command => ({ tr, dispatch, state }) => {
	const { $from, $to, empty } = tr.selection
	const $pos = pos !== undefined ? tr.doc.resolve(pos) : $to
	const blockquoteType = getNodeType(blockQuoteTypeOrName, state.schema)
	const citationType = getNodeType(citationTypeOrName, state.schema)
	const fallbackNodeType = getNodeType(fallbackNodeTypeOrName, state.schema)

	const matchesQuote = $pos.node(-1).type === blockquoteType
		|| $from.node(-1).type === blockquoteType
	const matchesCite = $pos.node().type === citationType
		|| $from.node().type === citationType

	if (matchesQuote || matchesCite) {
		const node = fallbackNodeType.createAndFill()
		if (!node) return false
		if (dispatch) {
			if (pos === undefined && !empty) {
				tr.delete($from.pos, $to.pos)
			}
			const position = pos ?? $to.pos
			const $position = tr.doc.resolve(position)
			const isAtEnd = position === $position.end()
			if (isAtEnd || matchesCite) {
				tr.insert(matchesCite ? $position.end() + 1 : position, node)
				tr.setSelection(TextSelection.near(tr.doc.resolve(tr.mapping.map(matchesCite ? $position.end() + 1 : position + 1)), isAtEnd ? -1 : 1))
			} else {
				tr.split(tr.mapping.map(pos ?? $to.pos), 3)
			}
		}
		return true
	}
	return false
}
