/**
 * Copies/moves an item to be before/after/child of the target item.
 */

import type { Command } from "@tiptap/core"
import { Fragment, type NodeType, Slice } from "prosemirror-model"
import { TextSelection } from "prosemirror-state"
import { ReplaceAroundStep } from "prosemirror-transform"


export const copyOrMoveListItem = () =>
	(
		itemPos: number,
		moveItemPos: number,
		position: "before" | "after" | "child",
		{
			move,
			listNode,
			itemNode,
		}: {
			move: boolean
			listNode: NodeType
			itemNode: NodeType
		}
	): Command =>
		({ tr, dispatch, state }) => {
			const $target = tr.doc.resolve(moveItemPos)
			const $item = tr.doc.resolve(itemPos)
			const { from, to } = state.selection
			const itemBefore = $item.before()
			const itemAfter = $item.after()
			const selectionFromOffset = from > itemBefore && from < itemAfter ? state.selection.from - itemBefore : undefined
			const selectionToOffset = to > itemBefore && to < itemAfter ? state.selection.to - itemBefore : undefined

			const deleteItemIfWanted = (): void => {
				if (move) {
					const isLastItem = $item.index(-1) === 0
					const offset = (isLastItem ? 2 : 1)
					tr.delete($item.start() - offset, $item.end() + offset)
				}
			}

			if (position === "after") {
				// the "next" resolved pos
				// could be a child list or a wrapping list
				const nodeAfterIsList = $target.after() + 1 !== $target.after(-1)
				if (!nodeAfterIsList) {
					if (dispatch) {
						const slice = tr.doc.slice($item.start() - 1, $item.end() + 1)
						deleteItemIfWanted()
						tr.replace(tr.mapping.map($target.end()), undefined, slice)
					}
					return true
				} else {
					let start = $target.after()
					let end = $target.end(-1)
					const slice = new Slice(
						Fragment.from([itemNode.create({}), $item.node()]),
						1,
						1,
					)
					if (dispatch) {
						deleteItemIfWanted()
						start = tr.mapping.map(start)
						end = tr.mapping.map(end)
						tr.step(new ReplaceAroundStep(start, end, start, end, slice, slice.size - 1, false))
						if (selectionFromOffset) {
							tr.setSelection(TextSelection.create(
								tr.doc,
									start + 1 + selectionFromOffset,
									selectionToOffset && selectionToOffset + 1 + start
							))
						}
					}
					return true
				}
			}
			if (position === "before") {
				if (dispatch) {
					deleteItemIfWanted()
					const start = tr.mapping.map($target.before(-1))
					tr.insert(start, $item.node())
					if (selectionFromOffset) {
						tr.setSelection(TextSelection.create(
							tr.doc,
									start + selectionFromOffset,
									selectionToOffset && selectionToOffset + start
						))
					}
				}
				return true
			}
			if (position === "child") {
				const nodeAfterIsList = $target.after() + 1 !== $target.after(-1)
				const slice = new Slice(
					Fragment.from([listNode.create({}, $item.node())]),
					0,
					nodeAfterIsList ? 1 : 0,
				)
				if (dispatch) {
					deleteItemIfWanted()
					const start = tr.mapping.map($target.end() + 1)
					const end = nodeAfterIsList
						? tr.mapping.map($target.end() + 2)
						: undefined
					tr.replace(start, end, slice)
					if (selectionFromOffset) {
						tr.setSelection(TextSelection.create(
							tr.doc,
								start + selectionFromOffset + 1,
								selectionToOffset && selectionToOffset + 1 + start
						))
					}
				}
				return true
			}
			return false
		}

