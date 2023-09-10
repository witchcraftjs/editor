import { getMarkType } from "@tiptap/core"
import type { MarkType, Node } from "@tiptap/pm/model"
import type { EditorState } from "@tiptap/pm/state"

/**
 * Get the position of any mark of the given type touching the given position.
 *
 * Basically searches outwards from the position until it finds a text node without the given mark type.
 */
// following where helpful but did not work at the end of the selection correctly
// https://discuss.prosemirror.net/t/find-extents-of-a-mark-given-a-selection/344/8
// https://discuss.prosemirror.net/t/expanding-the-selection-to-the-active-mark/478/9
export function getMarkPosition(
	state: EditorState,
	markTypeOrName: MarkType | string,
	pos: number
): { from: number, to: number } | null {
	const markType = getMarkType(markTypeOrName, state.schema)
	const $pos = state.doc.resolve(pos)
	const isAtEnd = $pos.parentOffset === $pos.parent.nodeSize - 2
	// get the start of the text node we're touching
	const startOffset = isAtEnd
		? $pos.parentOffset - 1
		: $pos.parentOffset
	const start = $pos.parent.childAfter(startOffset)
	if (!start) return null
	function hasMark(node: Node): boolean {
		const marks = node.marks
		for (const mark of marks) {
			if (mark.type === markType) return true
		}
		return false
	}
	const parent = $pos.parent
	// go to the previous node to start searching from
	let fromIndex = ($pos.index() - (isAtEnd ? 1 : 0)) - 1
	// leave position at the end of the previous node
	let fromPos = $pos.start() + (start?.offset ?? 0)
	// again leave the position
	let toPos = fromPos
	// go to the next node to start searching from
	let toIndex = fromIndex + 1
	while (fromIndex > 0 && hasMark(parent.child(fromIndex))) {
		const child = parent.child(fromIndex)
		const childSize = child.nodeSize
		fromIndex -= 1
		fromPos -= childSize
	}

	while (toIndex < parent.childCount && hasMark(parent.child(toIndex))) {
		const child = parent.child(toIndex)
		const childSize = child.nodeSize
		toIndex += 1
		toPos += childSize
	}
	return { from: fromPos, to: toPos }
}
