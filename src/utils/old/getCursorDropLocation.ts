import type { ResolvedPos, Slice } from "prosemirror-model"
import { dropPoint } from "prosemirror-transform"
import type { EditorView } from "prosemirror-view"


export function getCursorDropLocation(
	view: EditorView,
	e: MouseEvent,
	slice: Slice
): {
		$drop: ResolvedPos
		dropPoint: number
	} | undefined {
	const ePos = view.posAtCoords({ left: e.clientX, top: e.clientY })
	if (!ePos) return
	const point = dropPoint(view.state.doc, ePos.pos, slice) ?? ePos.pos
	let $drop = point <= 0
		? view.state.doc.resolve(1)
		: point >= view.state.doc.nodeSize - 1
			? view.state.doc.resolve(view.state.doc.nodeSize - 2)
			: view.state.doc.resolve(point)

	if ($drop.start() === 0) {
		// this happens when the position is the end of a text node
		$drop = view.state.doc.resolve(point - 1)
	}
	return { $drop, dropPoint: point }
}
