import type { Node, ResolvedPos } from "prosemirror-model"

import { debugNode } from "../internal/debugNode.js"

import { SELF } from "../../types.js"


/**
 * Traverse the tree upwards (along parents) to find a position.
 */
export function findUp(
	/** Position to start searching from. */
	$from: ResolvedPos,
	filter: (node: Node, pos: number, loop: number) => boolean,
	{
		start = SELF,
		step = 1,
	}: {
		/** where to start searching, -1 would be current node, 0 the parent, and so on. */
		start?: number
		step?: number
	} = {},
): number | undefined {
	let loops = 0
	for (
		let depth = start;
		depth < $from.depth;
		depth += step
	) {
		const currentDepth = $from.depth - depth
		const pos = $from.before(currentDepth + 1)
		const node = $from.node(currentDepth)
		if (filter(node, pos, loops)) {
			return pos
		}
		loops++
	}
	return undefined
}
