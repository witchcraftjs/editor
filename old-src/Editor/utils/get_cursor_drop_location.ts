import type { ResolvedPos, Slice } from "prosemirror-model"
import { dropPoint } from "prosemirror-transform"
import type { EditorView } from "prosemirror-view"

/**
 */
export function get_cursor_drop_location(view: EditorView, e: MouseEvent, slice: Slice): {
	$drop: ResolvedPos
	drop_point: number
} | void {
	let e_pos = view.posAtCoords({ left: e.clientX, top: e.clientY })
	if (!e_pos) return
	let drop_point = dropPoint(view.state.doc, e_pos.pos, slice) ?? e_pos.pos
	let $drop = drop_point <= 0
		? view.state.doc.resolve(1)
		: drop_point >= view.state.doc.nodeSize - 1
			? view.state.doc.resolve(view.state.doc.nodeSize - 2)
			: view.state.doc.resolve(drop_point)

	if ($drop.start() === 0) {
		// this happens when the position is the end of a text node
		$drop = view.state.doc.resolve(drop_point - 1)
	}
	return { $drop, drop_point }
}
