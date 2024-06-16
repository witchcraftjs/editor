import type { Node, ResolvedPos } from "prosemirror-model"

import { index_in } from "./index_in"
import { sum_children } from "./sum_children"

import { Filter, PARENT, PREV } from "@/components/Editor/types"


/**
 * Traverse siblings backwards.
 *
 * @param $from Position to start searching from. If depth is 0 (we're at the root), immediately returns undefined.
 * @param start How many initial siblings back to start at, -1 is itself, 0 the previous, and so on.
 * @param step How many steps to go back at a time.
 * @param stop Max number of siblings back to search from the start. If filter is undefined, returns the sibling as a position (if it exists, e.g. stop 100 with when there's only one sibling will return undefined)
 * @param filter Function that tells us whether to return the node or not.
 */
export function find_prev(
	main: Node,
	$from: ResolvedPos,
	{
		start = PREV,
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
	start += 1 // 0 is really self internally

	let index_in_parent = index_in(PARENT, $from)
	let start_index = index_in_parent - start
	let limit = (stop !== undefined && stop > start_index) || stop === undefined
		? index_in_parent + 1 - start
		: stop


	let $parent = main.resolve($from.before($from.depth))
	let start_pos = sum_children($parent, { end: start_index })

	// last child / self
	let $prev = main.resolve($parent.start() + start_pos + 1)
	for (
		let i = 0;
		i < limit;
		i += step
	) {
		if ((!filter && stop !== undefined && i >= stop - 1) || (filter?.($prev, i))) {
			return $prev
		}
		let prev_pos = $prev.start() - 2
		if (prev_pos <= 0) return undefined
		$prev = main.resolve(prev_pos)
	}
	return
}
