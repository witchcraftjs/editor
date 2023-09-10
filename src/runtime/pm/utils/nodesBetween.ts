import type { Node } from "@tiptap/pm/model"
import type { Selection } from "@tiptap/pm/state"

import type { NodesBetweenFilter } from "../../types/index.js"

/**
 * A more intuitive nodesBetween wrapper. Goes only through the nodes inside or touching the selection.
 *
 * Does not go through wrapping parents (except the first by default) that start/end before/after the given positions like nodesBetween.
 *
 * This can be changed by using the `shift` option, or `fromShift` and `toShift`.
 *
 * For example, if the cursor is in the middle of some text, using `{shift: 0}`, you would only get the text node.
 *
 * - Te|xt
 *
 * To get whatever it's parent item is, we need `{shift: -1}` (the default, since this is the most common use case).
 */
export function nodesBetween(doc: Node,
	{ $from, $to }: Pick<Selection, "$from" | "$to">,
	filter: NodesBetweenFilter,
	{
		shift = -1,
		fromShift,
		toShift
	}: {
		shift?: number
		fromShift?: number
		toShift?: number
	} = {}
): void {
	let shiftFrom = fromShift
	let shiftTo = toShift
	if (shift) {
		shiftFrom = shift
		shiftTo = shift
	}
	doc.nodesBetween($from.start(), $to.end(), (node, pos, ...args) => {
		const isAfterStart = pos >= $from.start(shiftFrom) - 1
		const isBeforeEnd = pos <= $to.end(shiftTo) + 1
		if (isAfterStart && isBeforeEnd) {
			const res = filter(node, pos, ...args)
			return res
		}
		return undefined
	})
}
