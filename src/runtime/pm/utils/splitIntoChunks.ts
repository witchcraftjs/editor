import { last, type Mutable } from "@alanscodelog/utils"
import type { Node, NodeType } from "@tiptap/pm/model"
import type { Selection } from "@tiptap/pm/state"

import { nodesBetween } from "./nodesBetween.js"

/**
 * When we have a selection like so:
 * ```
 * - A1
 * 	- B|1
 * - A|2
 * 	- B2
 * ```
 *
 * We can't lift/sink the range because they're in different depths.
 *
 * This will split a selection into a list of {$from, $to} that can be lifted/sunk, e.g. B1 and A2 (which includes it's children).
 *
 * If $from.depth > $to.depth like this, nothing is split (unless splitChildren is true) since sinking A1 implies sinking all it's children. The selection returned is adjusted though so $pos.node() is of the wanted node type.
 *
 * ```
 * - A|1
 * 	- B|1
 * - A2
 * ```
 * `splitChildren` should be true when lifting a list, if we want the above to lift B1 if the selection touches it.
 *
 * The function returns a selection like object with just $from and $to. This is because we need something like a BlockSelection really (multiple node selection), but NodeSelection does not support this.
 *
 * {@link mapSelection} can be used to map the returned selection. This is necessary if changing the chunks as you go through them.
 */
export const splitIntoChunks = (
	doc: Node,
	itemType: NodeType,
	selection: Pick<Selection, "$from" | "$to">,
	{
		splitChildren = false
	}: {
		splitChildren?: boolean
	} = {}
): Mutable<Pick<Selection, "$from" | "$to">>[] => {
	const { $from, $to } = selection
	const $newFrom = doc.resolve($from.before())
	const $lastTo = doc.resolve($to.after())
	const pairs: Mutable<Pick<Selection, "$from" | "$to">>[] = [{
		$from: $newFrom,
		$to: $lastTo
	}]
	let searchedDepth = 0
	let $last = $from
	nodesBetween(doc, { $from, $to }, (node, pos) => {
		if (node?.type === itemType) {
			const $pos = doc.resolve(pos + 1)
			if ($pos.depth < $newFrom.depth - (searchedDepth * 2)) {
				last(pairs).$to = $last
				pairs.push({ $from: $pos, $to: $lastTo })
				searchedDepth++
			} else if (splitChildren && $pos.depth !== $newFrom.depth) {
				pairs.push({ $from: $pos, $to: $lastTo })
			}
			$last = $pos
			return splitChildren
		}
		return true
	})
	return pairs
}
