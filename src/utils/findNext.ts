import type { Node, ResolvedPos } from "prosemirror-model"

import { indexIn } from "./indexIn.js"
import { sumChildren } from "./sumChildren.js"

import { type Filter, NEXT, PARENT } from "../types.js"

/**
 * Traverse siblings forwards.
 *
 * @param $from Position to start searching from. If depth is 0 (we're at the root), immediately returns undefined.
 *
 * @param start How many initial siblings forward to start at, -1 is itself, 0 the previous, and so on.
 * @param step How many steps to go forward at a time.
 * @param stop Max number of siblings forward to search from the start. If filter is undefined, returns the sibling as a position (if it exists, e.g. stop 100 with when there's only one sibling will return undefined)
 * @param filter Function that tells us whether to return the node or not.
 */
export function findNext(
	main: Node,
	$from: ResolvedPos,
	{
		start = NEXT,
		step = 1,
		stop,
	}: {
		start?: number
		step?: number
		stop?: number
	} = {},
	filter?: Filter,
): ResolvedPos | undefined {
	if ($from.depth === 0) return undefined // we're at the root node
	if (!filter && stop === undefined) throw new Error("A filter or stop must be specified, otherwise this function would always return undefined.")
	// if (stop === 0) throw new Error("stop cannot be 0, nothing would ever be returned")
	// if (stop !== undefined) stop += 1 // 0 is really self internally
	start += 1 // 0 is really self internally

	const indexInParent = indexIn(PARENT, $from)
	const $parent = main.resolve($from.before($from.depth))
	const childrenCount = $parent.node().childCount

	const startIndex = indexInParent + start
	const limit = (stop !== undefined && stop > childrenCount - startIndex) || stop === undefined
		? childrenCount - startIndex
		: stop


	const startPos = sumChildren($parent, { end: startIndex })

	// last child / self
	let nextPos = $parent.start() + startPos + 1
	if (nextPos >= main.nodeSize - 1) return undefined
	let $next = main.resolve(nextPos)
	for (
		let i = 0;
		i < limit;
		i += step
	) {
		if ((!filter && stop !== undefined && i >= stop - 1) || (filter?.($next, i))) {
			return $next
		}
		nextPos = $next.end() + 2
		if (nextPos >= main.nodeSize - 2) return undefined
		$next = main.resolve(nextPos)
	}
	return undefined
}
