import type { Command } from "@tiptap/core"
import type { Node } from "@tiptap/pm/model"
import { Fragment, Slice } from "@tiptap/pm/model"
import { TextSelection } from "@tiptap/pm/state"
import { ReplaceAroundStep } from "@tiptap/pm/transform"

import { getTypeByName } from "../../../utils/getTypeByName.js"
import { mapSelection } from "../../../utils/mapSelection.js"
import { splitIntoChunks } from "../../../utils/splitIntoChunks.js"
import { redirectFromEmbedded } from "../../EmbeddedDocument/utils/redirectFromEmbedded.js"

declare module "@tiptap/core" {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		indentItem: {
			/**
			 * @redirectable
			 */
			indentItem: (from?: number, to?: number) => ReturnType
		}

	}
}

export const indentItem = (
	itemTypeName: string,
	listTypeName: string
) =>
	(from?: number, to?: number): Command => ({ state, dispatch, tr, editor, view, commands }): boolean => {
		const redirect = redirectFromEmbedded(view, "indentItem", { args: [from, to], view, commands })
		if (redirect.redirected) { return redirect.result as any }

		const listType = getTypeByName(editor.schema, listTypeName)
		const itemType = getTypeByName(editor.schema, itemTypeName)

		const sel = from !== undefined
			? TextSelection.create(tr.doc, from, to)
			: state.selection.map(tr.doc, tr.mapping)

		const chunks = splitIntoChunks(tr.doc, itemType, sel)
		const blockRangeFilter = (node: Node): boolean => node.childCount > 0 && node.firstChild!.type === itemType

		let canChange = false
		for (const chunk of chunks) {
			const { $from, $to } = mapSelection(tr, chunk)
			const range = $from.blockRange($to, blockRangeFilter)
			if (!range) continue
			canChange = true
			const start = range.start
			const end = range.end

			// A
			//		B <- first child of A
			const itemIndex = $from.index(-1)
			const isFirstChild = itemIndex === 0
			// A <- nodebefore
			// B <-
			const nodeBefore = !isFirstChild
				? $from.node(-1).child(itemIndex - 1)
				: undefined
			// A
			// 	B <- nested node before
			// C <-
			const nodeBeforeIsNested = nodeBefore?.lastChild?.type === listType

			// item [list [item?]]
			const fragment = Fragment.from(
				itemType.create(
					null,
					Fragment.from(listType.create(
						null,
						Fragment.from(nodeBeforeIsNested ? itemType.create() : null)
					))
				)
			)

			// make sibling of previous by leaving /item /list /item open
			const startOpen = nodeBeforeIsNested
				? 3
			// just wrap in list
				: isFirstChild
					? 0
				// nest under sibling by leaving /item open
					: 1

			const slice = new Slice(
				fragment,
				startOpen,
				0
			)
			if (dispatch) {
				// debugNode(slice, `${slice.openStart}-${slice.openEnd}`)
				tr.step(new ReplaceAroundStep(
					start - startOpen,
					end,
					start,
					end,
					slice,
					isFirstChild ? 2 : 1,
					true
				))
			}
		}
		return canChange
	}
