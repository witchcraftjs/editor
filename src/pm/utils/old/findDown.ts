import type { Node, ResolvedPos } from "prosemirror-model"

import { CHILD, type Filter, type SkipFilter } from "@/components/Editor/types"


/**
 * Traverse the tree downwards (along start/end children, start by default) to find a position.
 *
 * @param main needed to resolve positions
 * @param $from position to start searching from
 * @param opts
 * @param opts.along whether to search down start/end children (start by default)
 * @param opts.skip modifies the resolved position (if a new position is returned) before giving it to the filter allowing, for example, skipping the children of some nodes, useful for going down lists (e.g. by skipping `p` nodes)
 * @param opts.start where to start searching, -1 would be current node, 0 the first child, and so on (starts at 0 by default)
 * @param opts.filter see {@link Filter}
 * @param opts.stop max number of children to go down (i.e. max search loop iterations)
 */
export function findDown(
	main: Node,
	$from: ResolvedPos,
	{
		start = CHILD,
		step = 1,
		stop,
		skip,
		along = "START",
	}: {
		start?: number
		step?: number
		stop?: number
		skip?: SkipFilter
		along?: "START" | "END"
	} = {},
	filter?: Filter,
): ResolvedPos | undefined {
	start += 1 // 0 is really self internally
	let $last: ResolvedPos | undefined
	let i = 0
	const fromStart = $from.start()
	let pos = along === "START"
		? $from.start()
		: $from.end()
	let $curr = main.resolve(pos)
	let depthBefore = Math.max($from.depth, ($last?.depth ?? 0))
	// let is_self = start === 0

	while ($curr.depth > depthBefore || (/* is_self &&  */$curr.start() === fromStart)) {
		if (skip) $curr = (skip($curr, i, main) ?? $curr) as ResolvedPos
		if (i >= start && i % step === 0 && ((!filter && stop === i) || (filter?.($curr, i)))) {
			return $curr
		}
		i++
		pos = along === "START"
			? $curr.start() + 1
			: $curr.end() - 1

		$last = $curr
		$curr = main.resolve(pos)
		depthBefore = Math.max($last.depth, depthBefore)

		if ($curr === undefined) return
	}
}
