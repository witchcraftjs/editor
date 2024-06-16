import type { Node, ResolvedPos } from "prosemirror-model"

import { Filter, SELF } from "@/components/Editor/types"


/**
 * Traverse the tree upwards (along parents) to find a position.
 * @param main needed to resolve positions
 * @param $from position to start searching from
 * @param opts
 * @param opts.start where to start searching, -1 would be current node, 0 the parent, and so on
 * @param opts.filter see {@link Filter}
 * @param opts.stop max number of parents up to search (i.e. max search loop iterations)
 */
export function find_up(
	main: Node,
	$from: ResolvedPos,
	{
		start = SELF,
		step = 1,
		stop,
	}: {
		start?: number
		step?: number
		stop?: number
	} = {},
	filter?: Filter): ResolvedPos | undefined {
	let loops = 0
	for (
		let depth = start;
		depth < $from.depth;
		depth += step
	) {
		let current_depth = $from.depth - depth

		let $pos = main.resolve($from.before(current_depth))
		if ((!filter && stop === loops) || filter?.($pos, loops)) {
			return $pos
		}
		loops++
	}
	return undefined
}
