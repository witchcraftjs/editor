import type { Node } from "prosemirror-model"
import type { Selection } from "prosemirror-state"

import type { NodesBetweenFilter } from "../../types.js"

/**
 * A more intuitive nodesBetween wrapper. Goes only through the nodes inside or touching the selection.
 *
 * Does not go through wrapping parents that start/end before/after the given positions like nodesBetween.
 *
 * Note you might need to use the shift option to include certain node types. For example:
 *
 * - Te|xt
 *
 * If the cursor is here, you will only get a text node. To get whatever it's parent item is, use `{shift: -1}` which is short fro `{fromShift: -1, toShift:-1}`
 *
 */
export function nodesBetween(doc: Node,
	{ $from, $to }: Pick<Selection, "$from" | "$to">,
	opts: ({ shift?: number, fromShift?: number, toShift?: number }),
	filter: NodesBetweenFilter
): void {
	let shiftFrom = opts.fromShift
	let shiftTo = opts.toShift
	if (opts.shift) {
		shiftFrom = opts.shift
		shiftTo = opts.shift
	}
	doc.nodesBetween($from.start(), $to.start(), (node, pos, ...args) => {
		const isAfterStart = pos >= $from.start(shiftFrom) - 1
		const isBeforeEnd = pos <= $to.end(shiftTo) + 1
		if (isAfterStart && isBeforeEnd) {
			const res = filter(node, pos, ...args)
			return res
		}
	})
}
