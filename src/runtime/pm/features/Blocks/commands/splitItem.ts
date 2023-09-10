import { unreachable } from "@alanscodelog/utils/unreachable"
import { type Command, getNodeType } from "@tiptap/core"
import { GapCursor } from "@tiptap/pm/gapcursor"
import type { NodeType } from "@tiptap/pm/model"
import { TextSelection } from "@tiptap/pm/state"
import { canSplit } from "@tiptap/pm/transform"
import { nanoid } from "nanoid"

import { redirectFromEmbedded } from "../../EmbeddedDocument/utils/redirectFromEmbedded.js"

declare module "@tiptap/core" {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		splitItem: {
			/**
			 * Splits one list item into two list items. Does not lift like the default `splitListItem` command. Also takes care of generating a new uuid.
			 *
			 * @redirectable
			 */
			splitItem: (pos?: number) => ReturnType
		}
	}
}

export const splitItem = (
	itemType: string,
	/** When at the end of a list item, the new list item will contain a node of this type. */
	fallbackNodeTypeOrName: string | NodeType = "paragraph",
	idLength: number = 10
) => (pos?: number): Command => ({ state, tr, editor, view, commands, dispatch }): boolean => {
	const redirect = redirectFromEmbedded(view, "splitItem", { args: [pos], view, commands })
	if (redirect.redirected) { return redirect.result as any }

	const { $from, $to, to, empty } = pos
		? TextSelection.create(tr.doc, pos)
		: state.selection.map(tr.doc, tr.mapping)

	const parentItem = $from.node(-1)
	const parentEndItem = $to.node(-1)
	// we can attempt to keep the end item's blockId if it's different
	// this happens when the user selects from one block to another
	const blockId = parentItem.attrs.blockId === parentEndItem.attrs.blockId ? nanoid(idLength) : parentEndItem.attrs.blockId
	const isAtGapCursor = state.selection instanceof GapCursor
	const parentsAreItems = parentItem.type.name === itemType && parentEndItem.type.name === itemType

	if (isAtGapCursor || parentsAreItems) {
		const fallbackNodeType = getNodeType(fallbackNodeTypeOrName, editor.schema)
		const isAtEnd = empty && to === $from.end()
		const nodeType = getNodeType(itemType, editor.schema)
		// can't seem to get split to work with a gap cursor
		if (isAtGapCursor) {
			if (dispatch) {
				const $realFrom = tr.doc.resolve($from.pos - 1)
				const $realTo = tr.doc.resolve($to.pos - 1)
				const realParentEndItem = $realFrom.node()
				const realParentItem = $realTo.node()
				if (realParentItem !== realParentEndItem || realParentItem.type.name !== itemType || realParentEndItem.type.name !== itemType) {
					unreachable()
				}
				tr.insert(
					$from.pos,
					nodeType.create({
						...realParentEndItem.attrs,
						blockId: undefined
					}, [
						fallbackNodeType.create()
					])
				)
			}
		} else if (isAtEnd) {
			const args: Parameters<typeof tr.split> = [
				$from.pos,
				2,
				[{
					type: nodeType,
					attrs: { ...parentEndItem.attrs, blockId }
				}, {
					type: fallbackNodeType
				}]
			]
			const canSplitNode = canSplit(tr.doc, ...args)

			if (dispatch) {
				tr.split(...args)
			}
			return canSplitNode
		} else {
			const nodeTo = $to.node()
			const args: Parameters<typeof tr.split> = [$from.pos, 2, [
				{
					type: nodeType,
					attrs: {
						...parentEndItem.attrs,
						blockId
					}
				},
				{
					type: nodeTo.type,
					attrs: nodeTo.attrs
				}
			]]
			// i don't think this is really accurate since we didn't delete first
			const canSplitNode = !dispatch && canSplit(tr.doc, ...args)

			if (dispatch) {
				tr.delete($from.pos, $to.pos)
				const accurateCanSplitNode = canSplit(tr.doc, ...args)
				if (!accurateCanSplitNode) { return false }
				tr.split(...args)
				return true
			}
			return canSplitNode
		}
	}
	return false
}
