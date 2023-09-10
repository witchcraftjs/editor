/**
 * Copies/moves an item to be before/after/child of the target item.
 */

import type { Command } from "@tiptap/core"
import { Fragment, Slice } from "@tiptap/pm/model"
import { TextSelection } from "@tiptap/pm/state"
import { ReplaceAroundStep } from "@tiptap/pm/transform"

import { redirectFromEmbedded } from "../../EmbeddedDocument/utils/redirectFromEmbedded.js"

declare module "@tiptap/core" {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		copyOrMoveItem: {
			/**
			 * @redirectable
			 */
			copyOrMoveItem: (
				itemPos: number,
				moveItemPos: number,
				position: "before" | "after" | "child",
				options?: {
					move?: boolean
				}
			) => ReturnType
		}
	}
}

/** Copies or moves a single list item. This is for using while dragging an item. */
export const copyOrMoveItem = ({
	listNodeTypeName = "list",
	itemNodeTypeName = "item"
}: {
	listNodeTypeName?: string
	itemNodeTypeName?: string
} = {}) =>
	(
		itemPos: number,
		moveItemPos: number,
		position: "before" | "after" | "child",
		{
			move = true
		}: { move?: boolean } = {}
	): Command =>
		({ tr, state, view, commands, dispatch }): boolean => {
			const redirect = redirectFromEmbedded(
				view,
				"copyOrMoveItem",
				{ args: [itemPos, moveItemPos, position, { move }], view, commands }
			)
			if (redirect.redirected) {
				return redirect.result as any // todo
			}

			const listNode = state.schema.nodes[listNodeTypeName]
			const itemNode = state.schema.nodes[itemNodeTypeName]
			const $targetItem = tr.doc.resolve(moveItemPos)
			const $item = tr.doc.resolve(itemPos)
			if ($item.node().type.name !== itemNodeTypeName) {
				throw new Error(`itemPos ${itemPos} does not point to node type ${itemNodeTypeName} but to ${$item.node().type.name}`)
			}
			if ($targetItem.node().type.name !== itemNodeTypeName) {
				throw new Error(`moveItemPos ${moveItemPos} does not point to node type ${itemNodeTypeName} but to ${$targetItem.node().type.name}`)
			}

			// internally we use $target pointing at the first node of the item (e.g. a paragraph or some other block content)
			// this makes it easier to tell if it has a list child after the p or not
			const $target = tr.doc.resolve($targetItem.start() + 1)
			// sometimes the target is still pointing at an item
			// this happens with blocks that have no inline content, such as embedded docs
			// these require some special handling and shifting of positions since we cant resolve to a ResolvedPos whose .node() is the block
			const targetIsContentless = $target.node().type.name === $targetItem.node().type.name
			const parent = targetIsContentless ? $targetItem.node() : $target.node(-1)
			const nodeAfterIsList = parent.childCount > 1 && parent.child(1).type.name === listNodeTypeName

			const { from, to } = state.selection.map(tr.doc, tr.mapping)
			const beforeItemPos = $item.before()
			const afterItemPos = $item.after()

			const selectionFromOffset = from > beforeItemPos && from < afterItemPos ? state.selection.from - beforeItemPos : undefined
			const selectionToOffset = to > beforeItemPos && to < afterItemPos ? state.selection.to - beforeItemPos : undefined
			function restoreSelection(start: number): void {
				if (!dispatch) return
				// attempt to restore selection to inside the item if it was inside
				// this will also restore it to just the start if it was touching
				if (selectionFromOffset) {
					tr.setSelection(TextSelection.create(
						tr.doc,
						start + selectionFromOffset,
						selectionToOffset && selectionToOffset + start
					))
				} else if (selectionToOffset) {
					// otherwise to the end if it was touching
					tr.setSelection(TextSelection.create(
						tr.doc,
						selectionToOffset && selectionToOffset + start
					))
				} else {
					// otherwise to the start of the item
					const $start = tr.doc.resolve(start)
					const sel = TextSelection.findFrom($start, 1, true)
					if (sel) {
						tr.setSelection(sel)
					}
				}
			}

			const deleteItemIfWanted = (): void => {
				if (!dispatch) return
				if (move) {
					const isLastItem = $item.index(-1) === 0
					const offset = (isLastItem ? 2 : 1)
					const start = $item.start() - offset
					const end = $item.end() + offset
					tr.delete(start, end)
				}
			}
			if (position === "after") {
				if (!nodeAfterIsList) {
					const slice = tr.doc.slice($item.start() - 1, $item.end() + 1)
					deleteItemIfWanted()
					if (dispatch) tr.replace(tr.mapping.map($target.end()), undefined, slice)
					restoreSelection(tr.mapping.map($target.end()) + 2)
					return true
				} else {
					// start/end need to point at the start/end of the child list
					// this is more foolproof than using .after due to contentless blocks
					let start = $targetItem.start() + $targetItem.node().child(0).nodeSize
					let end = start + $targetItem.node().child(1).nodeSize
					const slice = new Slice(
						Fragment.from([itemNode.create({}), $item.node()]),
						1,
						1
					)
					deleteItemIfWanted()
					start = tr.mapping.map(start)
					end = tr.mapping.map(end)
					if (dispatch) {
						tr.step(new ReplaceAroundStep(
							start,
							end,
							start,
							end,
							slice,
							slice.size,
							false
						))
					}
					restoreSelection(start + 1)
					return true
				}
			}
			if (position === "before") {
				deleteItemIfWanted()
				const start = tr.mapping.map($target.before(targetIsContentless ? undefined : -1))
				if (dispatch) tr.insert(start, $item.node())
				restoreSelection(start)
				return true
			}
			if (position === "child") {
				const slice = new Slice(
					Fragment.from([listNode.create({}, $item.node())]),
					0,
					nodeAfterIsList ? 1 : 0
				)
				deleteItemIfWanted()
				const unmappedStart = $target.start() + $target.node().child(0).nodeSize + (targetIsContentless ? 0 : 1)
				const start = tr.mapping.map(unmappedStart)
				const end = nodeAfterIsList
					? start + 1
					: undefined
				if (dispatch) tr.replace(start, end, slice)
				restoreSelection(start + 1)
				return true
			}
			return false
		}
