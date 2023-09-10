import type { Node, ResolvedPos } from "prosemirror-model"
import { type Filter, PARENT, PREV } from "src/types.js"

import { indexIn } from "./indexIn.js"
import { sumChildren } from "./sumChildren.js"


/**
 * Traverse siblings backwards.
 */
export function findPrev(
	main: Node,
	/** Position to start searching from. If depth is 0 (we're at the root), immediately returns undefined. */

	$from: ResolvedPos,
	{
		/** How many initial siblings back to start at, -1 is itself, 0 the previous, and so on.*/
		start = PREV,
		/** How many steps to go back at a time.*/
		step = 1,
		/** Max number of siblings back to search from the start. If filter is undefined, returns the sibling as a position (if it exists, e.g. stop 100 with when there's only one sibling will return undefined)*/
		stop,
	}: {
		start?: number
		step?: number
		stop?: number
	} = {},
	filter?: Filter,
): ResolvedPos | undefined {
	// we're at the root node
	if ($from.depth === 0) return undefined

	if (!filter && stop === undefined) throw new Error("A filter or stop must be specified, otherwise this function would always return undefined.")

	start += 1 // 0 is really self internally

	const indexinParent = indexIn(PARENT, $from)
	const startIndex = indexinParent - start
	const limit = (stop !== undefined && stop > startIndex) || stop === undefined
		? indexinParent + 1 - start
		: stop


	const $parent = main.resolve($from.before($from.depth))
	const startPos = sumChildren($parent, { end: startIndex })

	// last child / self
	let $prev = main.resolve($parent.start() + startPos + 1)
	for (
		let i = 0;
		i < limit;
		i += step
	) {
		if ((!filter && stop !== undefined && i >= stop - 1) || (filter?.($prev, i))) {
			return $prev
		}
		const prevPos = $prev.start() - 2
		if (prevPos <= 0) return undefined
		$prev = main.resolve(prevPos)
	}
	return undefined
}
