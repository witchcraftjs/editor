import type { Command } from "@tiptap/core"
import { Fragment, Slice } from "prosemirror-model"
import { ReplaceAroundStep } from "prosemirror-transform"

import { getTypeByName } from "../utils/getTypeByName.js"
import { debugNode } from "../utils/internal/debugNode.js"
import { mapSelection } from "../utils/mapSelection.js"
import { splitIntoChunks } from "../utils/splitIntoChunks.js"


export const indentListItem = (
	itemTypeName: string,
) =>
	(): Command =>
		({ state, dispatch, tr, editor }) => {
			const itemType = getTypeByName(editor.schema, itemTypeName)
			const chunks = splitIntoChunks(tr.doc, itemType, state.selection)
			const blockRangeFilter = (node: Node): boolean => node.childCount > 0 && node.firstChild!.type === itemType
			
			let canChange = false
			for (const chunk of chunks) {
				const { $from, $to } = mapSelection(tr, chunk,)
				const range = $from.blockRange($to, blockRangeFilter)
				if (!range) continue
				canChange = true
				const start = range.start
				const end = range.end
				const listType = $from.node(-1).type
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

				// make sibling of previous by living /item /list /item open
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
					debugNode(slice, `${slice.openStart}-${slice.openEnd}`)
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

