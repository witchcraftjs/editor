import type { Node, ResolvedPos } from "@tiptap/pm/model"

/**
 * Traverse the tree upwards (along parents, along the left) to find a position.
 */
export function findUpwards(
	/** Needed to resolve positions from. */
	node: Node,
	/** Position to start searching from. */
	from: number,
	filter: ($pos: ResolvedPos, pos: number, loop: number) => boolean,
	{
		start = -1,
		step = 1,
		stop
	}: {
		/** Where to start searching, -1 would be current node (default), 0 the parent, and so on. */
		start?: number
		step?: number
		/* Max number of parents up to search (i.e. max search loop iterations) */
		stop?: number
	} = {}

): { $pos: ResolvedPos, pos: number } | { $pos: undefined, pos: undefined } {
	const $from = node.resolve(from)
	let loops = 0
	for (
		let depth = start;
		depth < $from.depth;
		depth += step
	) {
		const currentDepth = $from.depth - depth

		const newPos = $from.before(currentDepth)
		const $pos = node.resolve(newPos)
		// console.log("newPos", newPos, $pos)
		if ((!filter && stop === loops) || filter($pos, newPos, loops)) {
			return { $pos, pos: newPos }
		}
		loops++
	}
	return { $pos: undefined, pos: undefined }
}
