import type { Node, ResolvedPos } from "prosemirror-model"

import { type Filter, SELF } from "../types.js"


/**
 * Traverse the tree upwards (along parents) to find a position.
 */
export function findUp(
	/** Node to resolve positions with, usually the root doc. */
	doc: Node,
	/** Position to start searching from. */
	$from: ResolvedPos,
	{
		start = SELF,
		step = 1,
		stop,
	}: {
		/** where to start searching, -1 would be current node, 0 the parent, and so on. */
		start?: number
		step?: number
		/* Max number of parents up to search (i.e. max search loop iterations) */
		stop?: number
	} = {},
	/** see {@link Filter} */
	filter?: Filter
): ResolvedPos | undefined {
	let loops = 0
	for (
		let depth = start;
		depth < $from.depth;
		depth += step
	) {
		const currentDepth = $from.depth - depth

		const $pos = doc.resolve($from.before(currentDepth))
		if (stop === loops || filter?.($pos, loops)) {
			return $pos
		}
		loops++
	}
	return undefined
}
