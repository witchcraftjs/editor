import type { Command } from "@tiptap/core"
import type { ResolvedPos } from "@tiptap/pm/model"
import { TextSelection } from "@tiptap/pm/state"

import { getTypeByName } from "../../../utils/getTypeByName.js"
import { debugNode } from "../../../utils/internal/debugNode.js"
import { nodesBetween } from "../../../utils/nodesBetween.js"
import { redirectFromEmbedded } from "../../EmbeddedDocument/utils/redirectFromEmbedded.js"

declare module "@tiptap/core" {

	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		moveItem: {
			/**
			 * @redirectable
			 */
			moveItem: (
				dir: "down" | "up",
				pos?: number,
			) => ReturnType
		}
	}
}
export const moveItem = (
	itemTypeName: string
) =>
	(
		dir: "down" | "up" = "down",
		pos?: number
	): Command =>
		({ state, dispatch, tr, editor, commands, view }): boolean => {
			const redirect = redirectFromEmbedded(view, "moveItem", { args: [pos], view, commands })
			if (redirect.redirected) { return redirect.result as any }

			const itemType = getTypeByName(editor.schema, itemTypeName)
			const { $from, $to, from, to } = pos
				? TextSelection.create(tr.doc, pos, pos)
				: state.selection.map(tr.doc, tr.mapping)
			const sharedDepth = Math.min($from.depth, $to.depth)

			// get a slice of equal depths
			// - A1
			// 	- B|1
			// - A|2
			// would move A1 to A2
			const $targetFrom = tr.doc.resolve($from.before($from.depth - sharedDepth - 1) + 1)
			const $targetTo = tr.doc.resolve($to.before(sharedDepth - $to.depth - 1) + 1)
			debugNode($targetFrom, `$targetFrom`)
			debugNode($targetTo, `$targetTo`)
			const range = $targetFrom.blockRange($targetTo)
			if (!range) return false
			const start = range.$from.start()
			const end = range.$to.end()
			const slice = tr.doc.slice(start, end)

			const itemBefore = $targetFrom.before()
			const itemAfter = $targetTo.after()
			const selectionFromOffset = from > itemBefore && from < itemAfter ? state.selection.from - itemBefore : undefined
			const selectionToOffset = to > itemBefore && to < itemAfter ? state.selection.to - itemBefore : undefined

			function restoreSelection(start: number): void {
				if (dispatch && selectionFromOffset) {
					tr.setSelection(TextSelection.create(
						tr.doc,
						start + selectionFromOffset,
						selectionToOffset && selectionToOffset + start
					))
				}
			}

			if (dir === "up") {
				const index = $targetFrom.index(-1)
				const isFirstTopLevelItem = sharedDepth <= 2 && index === 0
				if (isFirstTopLevelItem) return false
				const $itemBefore
					= $targetFrom.index(-1) === 0
					// get parent
						? tr.doc.resolve($targetFrom.before(-2) + 1)
					// get previous sibling
						: tr.doc.resolve($targetFrom.start() - 2)
				if (!$itemBefore || $itemBefore.node().type.name !== itemType.name) return false
				if (dispatch) {
					tr.delete(start - 2, end + 2)
					const selStart = tr.mapping.map($itemBefore.start()) - 1
					tr.insert(tr.mapping.map($itemBefore.start()), slice.content)
					restoreSelection(selStart)
				}
			}
			if (dir === "down") {
				// search forward until we find the next item
				// we don't do something like above, because the next item might be
				// way further up (less deep), but we can't know how many levels up
				let $afterItem: ResolvedPos | undefined
				nodesBetween(tr.doc, {
					$from: tr.doc.resolve($to.pos),
					$to: tr.doc.resolve(tr.doc.resolve(0).end())

				}, (node, pos) => {
					if (!$afterItem && node?.type.name === itemType.name) {
						$afterItem = tr.doc.resolve(pos + 1)
					}
					return false
				})
				if (!$afterItem) return false
				// sibling
				if ($afterItem.depth === sharedDepth - 1) {
					if (dispatch) {
						tr.delete(start - 2, end + 2)
						const selStart = tr.mapping.map($afterItem.end() + 1)
						tr.insert(tr.mapping.map($afterItem.end() + 1), slice.content)
						restoreSelection(selStart)
					}
				} else {
					if (dispatch) {
						// the next item is at a much higher depth
						// we make it the child instead
						const $child = tr.doc.resolve($afterItem.start() + 1)
						const insertPos = $child.end() + 1
						tr.delete(start - 2, end + 2)
						const selStart = tr.mapping.map(insertPos)
						tr.insert(tr.mapping.map(insertPos), slice.content)
						restoreSelection(selStart)
					}
				}
			}
			return true
		}
