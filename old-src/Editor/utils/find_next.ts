import type { Node, ResolvedPos } from "prosemirror-model"

import { index_in } from "./index_in"
import { sum_children } from "./sum_children"

import { Filter, NEXT, PARENT } from "@/components/Editor/types"

/**
 * Traverse siblings forwards.
 *
 * * @param $from Position to start searching from. If depth is 0 (we're at the root), immediately returns undefined.
 * @param start How many initial siblings forward to start at, -1 is itself, 0 the previous, and so on.
 * @param step How many steps to go forward at a time.
 * @param stop Max number of siblings forward to search from the start. If filter is undefined, returns the sibling as a position (if it exists, e.g. stop 100 with when there's only one sibling will return undefined)
 * @param filter Function that tells us whether to return the node or not.
 */
export function find_next(
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

	let index_in_parent = index_in(PARENT, $from)
	let $parent = main.resolve($from.before($from.depth))
	let children_count = $parent.node().childCount

	let start_index = index_in_parent + start
	let limit = (stop !== undefined && stop > children_count - start_index) || stop === undefined
		? children_count - start_index
		: stop


	let start_pos = sum_children($parent, { end: start_index })

	// last child / self
	let next_pos = $parent.start() + start_pos + 1
	if (next_pos >= main.nodeSize - 1) return undefined
	let $next = main.resolve(next_pos)
	for (
		let i = 0;
		i < limit;
		i += step
	) {
		if ((!filter && stop !== undefined && i >= stop - 1) || (filter?.($next, i))) {
			return $next
		}
		next_pos = $next.end() + 2
		if (next_pos >= main.nodeSize - 2) return undefined
		$next = main.resolve(next_pos)
	}
	return
}
