import type { ResolvedPos } from "prosemirror-model"
import type { EditorView } from "prosemirror-view"

/**
 * Find a location for dropping full/closed list items.
 * Given a view and a mouse event it will return resolved position to the drop item `$drop`, `insert` which tells you whether the slice should be inserted `before`, `after`, or as a `child` of a dropped position (useful for creating decorations), the drop position, `drop_pos`, to insert at for convenience, and the correct wanted `drop_level` (same as `$drop` is `insert` is `before/after` otherwise +1 for `child`).
 *
 * This is calculated by where the mouse is relative to a node. For example, if we "zoom" in on a section like this where the mouse is hovering over B1:
 *
 * ```
 * ...
 * 		- C1
 * 	- B1
 * - A1
 * ...
 * ```
 * It's divided into 3 parts:
 * ```
 * _____________________________________________________________________________________
 * 1. Before B1 + Indent      + Text Top Half
 *                            |
 * ___________________________|_________________________________________________________
 *                            | Text Bottom Half
 * 2. Before B1 + 2 x Indent  |                      | 3. Text Bottom Half (1 Indent In)
 * ___________________________|______________________|__________________________________
 * ```
 * - If the mouse is in `2` or `3`, `$drop` points to `B1`. If it's in `2` before where children would go, `insert` is `after`, otherwise in `3` insert is `child`
 * - If the mouse is anywhere in `1`, `$drop` points to `C1` instead, and insert is calculated the same but relative to `C1`'s position instead.
 * - There is also one special case, when we are hovering above the first node, `insert` will be `before` instead and `$drop` will just point to the top most node.
 */
export function get_drop_location(view: EditorView, e: MouseEvent): {
	$drop: ResolvedPos
	insert: string
	drop_pos: number
	drop_level: number
	el: HTMLElement
	info: ReturnType<HTMLElement["getBoundingClientRect"]>
} | void {
	// ignores the real e.clientX, which will fail if we're to the left of a node
	// search along the right edge of the editor instead
	let e_pos = view.posAtCoords({ left: view.dom.getBoundingClientRect().right - 5, top: e.clientY })
	if (!e_pos) {return}

	let el: Text | HTMLElement | null = view.domAtPos(e_pos.pos).node as any
	if (!el) {return}
	if (el instanceof Text) {
		el = el.parentElement!.closest("div")
	}
	if (!(el instanceof HTMLDivElement)) {
		el = (el as HTMLElement).closest("div")
	}
	let info = (el as HTMLElement).getBoundingClientRect()
	let handle_space = parseInt(window.getComputedStyle(el!).paddingLeft.slice(0, -2), 10) * 2


	let insert
	let $drop
	if (e.clientY >= info.top && e.clientY <= info.bottom) {
		let in_top_half = e.clientY < info.top + (info.height / 2)
		let in_bottom_half = e.clientY < info.bottom
		let to_left_of_item = e.clientX < info.left + handle_space
		if (in_top_half) {
			let prev: HTMLDivElement = el!.previousSibling as any
			// the special case where we're at the very very top of the document
			if (!prev) {
				insert = "before"
				$drop = view.state.doc.resolve(view.posAtDOM(el!, 0))
			} else {
				info = prev.getBoundingClientRect()
				let to_left_of_prev = e.clientX < info.left + handle_space
				insert = to_left_of_prev
					? "after"
					: "child"
				$drop = view.state.doc.resolve(view.posAtDOM(prev, 0))
				el = prev
			}
		} else if (in_bottom_half) {
			insert = to_left_of_item
				? "after"
				: "child"
			$drop = view.state.doc.resolve(view.posAtDOM(el!, 0))
		}
	} else {
		throw new Error("should not happen")
	}
	if (!$drop || !insert || !el || !info) {return}
	let drop_pos!: number
	let drop_level!: number
	switch (insert) {
		case "before":
			drop_pos = $drop.start() - 1
			drop_level = 0
			break
		case "after":
			drop_pos = $drop.end() + 1
			drop_level = $drop.node().attrs.level
			break
		case "child":
			drop_pos = $drop.end() + 1
			drop_level = ($drop.node().attrs.level as number) + 1
			break
	}
	return { insert, $drop, drop_pos, drop_level, el, info }
}
