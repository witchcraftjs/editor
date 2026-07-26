import type { Command } from "@tiptap/core"
import { Selection, TextSelection } from "@tiptap/pm/state"

import { redirectFromEmbedded } from "../features/EmbeddedDocument/utils/redirectFromEmbedded.js"
import { findUpwards } from "../utils/findUpwards.js"

declare module "@tiptap/core" {

	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		backspace: {
			/**
			 * @redirectable
			 */
			backspace: () => ReturnType
		}
	}
}

export const backspace = () =>
	(): Command =>
		({ state, tr, commands, dispatch, view }): any => {
			const { from, to, $from } = state.selection.map(tr.doc, tr.mapping)
			if (from !== to) {
				return commands.deleteSelection()
			}

			const redirect = redirectFromEmbedded(view, "backspace", { args: [], view, commands })
			if (redirect.redirected) { return redirect.result }
			// we're NOT at the start of a block and can just delete
			if ($from.start() !== from) {
				if (dispatch) tr.delete(from - 1, to)
				return true
			}
			// else we're at the start of a block and must "joinBackwards"
			// find the nearest "item" parent
			const { $pos: $itemPos, pos: itemPos } = findUpwards(
				tr.doc,
				from,
				$p => $p.node($p.depth)?.type.name === "item",
				{ start: 0 }
			)
			if (!$itemPos) return false

			// if found, grab the sibling node immediately preceding it
			// $itemPos is resolved inside the item, so we need its parent (list)
			const listItem = $itemPos ? $itemPos.node($itemPos.depth - 1) : null
			const prevChild = listItem
				? listItem.maybeChild($itemPos.index($itemPos.depth - 1) - 1)
				: null

			const prevItemHasLeaf = prevChild?.type.name === "item"
				&& prevChild.childCount === 1
				&& prevChild.firstChild?.isLeaf

			// ff the previous child is a leaf item, Selection.findFrom skips it,
			// deleting all the way to the first text position it finds
			// so we delete the node itself instead
			if (prevItemHasLeaf && prevChild && itemPos !== undefined) {
				if (dispatch) {
					const deleteFrom = itemPos - prevChild.nodeSize
					tr.delete(deleteFrom, itemPos)
					tr.setSelection(TextSelection.near(tr.doc.resolve(from - prevChild.nodeSize)))
				}
				return true
			}

			// delete to the previous item
			const endsEqual = $from.end() === $from.start()
			const newFrom = Selection.findFrom(state.doc.resolve(from - 1), -1, true)
			if (!newFrom) return false

			if (dispatch) {
				tr.delete(newFrom.from, to + (endsEqual ? 2 : 0))
				tr.setSelection(new TextSelection(tr.doc.resolve(newFrom.from)))
			}
			return true
		}
