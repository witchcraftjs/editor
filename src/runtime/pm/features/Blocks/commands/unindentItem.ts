import type { Command } from "@tiptap/core"
import type { Node } from "@tiptap/pm/model"
import { TextSelection } from "@tiptap/pm/state"
import { canJoin, liftTarget } from "@tiptap/pm/transform"

import { getTypeByName } from "../../../utils/getTypeByName.js"
import { mapSelection } from "../../../utils/mapSelection.js"
import { splitIntoChunks } from "../../../utils/splitIntoChunks.js"
import { redirectFromEmbedded } from "../../EmbeddedDocument/utils/redirectFromEmbedded.js"

declare module "@tiptap/core" {

	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		unindentItem: {
			/**
			 * @redirectable
			 */
			unindentItem: (from?: number, to?: number) => ReturnType
		}

	}
}

export const unindentItem = (
	itemTypeName: string
) =>
	(from?: number, to?: number): Command =>
		({ state, dispatch, tr, editor, view, commands }): boolean => {
			const redirect = redirectFromEmbedded(view, "unindentItem", { args: [from, to], view, commands })
			if (redirect.redirected) { return redirect.result as any }

			const itemType = getTypeByName(editor.schema, itemTypeName)
			const sel = from !== undefined
				? TextSelection.create(tr.doc, from, to)
				: state.selection.map(tr.doc, tr.mapping)

			const chunks = splitIntoChunks(tr.doc, itemType, sel, { splitChildren: true })
			const blockRangeFilter = (node: Node): boolean => node.childCount > 0 && node.firstChild!.type === itemType
			let canChange = false
			for (const chunk of chunks) {
				const { $from, $to } = mapSelection(tr, chunk)
				const range = $from.blockRange($to, blockRangeFilter)
				if (!range) return false
				/**
				 * The following logic is adapted from prosemirror-schema-list's liftItem.
				 * See https://github.com/ProseMirror/prosemirror-schema-list/blob/master/src/schema-list.ts#L173
				 *
				 * Because we are always working with "lists", there's no need for some of the logic there.
				 *
				 * Also we need to apply the changes per chunk.
				 *
				 * This allows unindenting an entire selection until all items reach the root,
				 * even if the selection had several nested lists. This only affects the selected items,
				 * not any children that are not part of the selection.
				 */

				// A <- isTopLevel
				//		B <- isNotTopLevel
				const isTopLevel = range.depth <= 1

				if (!isTopLevel) {
					const end = range.end
					const target = liftTarget(range)
					if (target === null) continue
					if (dispatch) {
						tr.lift(range, target)
					}
					const after = tr.mapping.map(end, -1) - 1
					if (canJoin(tr.doc, after)) {
						if (dispatch) {
							tr.join(after)
						}
					}
					if (dispatch) {
						tr.scrollIntoView()
					}
					canChange = true
				}
			}
			return canChange
		}
