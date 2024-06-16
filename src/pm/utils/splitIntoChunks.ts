import { last, type Mutable } from "@alanscodelog/utils"
import type { Node, NodeType } from "prosemirror-model"
import type { Selection } from "prosemirror-state"

import { debugNode } from "./internal/debugNode.js"
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
 * This will split a selection into a list of {$from, $to} that can be lifted/sunk, e.g. B1 and A2 (which includes it's children).
 *
 * If $from.depth > $to.depth like this, nothing is split since lifting A1 implies lifting all it's children. The selection returned is adjusted though so $pos.node() is of the wanted node type. *
 * ```
 * - A|1
 * 	- B|1
 * - A2
 * ```
 */
export const splitIntoChunks = (
	doc: Node,
	itemType: NodeType,
	selection: Pick<Selection, "$from" | "$to">,
	// { splitChildren = false, maxChildDepth }: { splitChildren?: boolean, maxChildDepth?: number } = {}
): Mutable<Pick<Selection, "$from" | "$to">>[] => {
	const { $from, $to } = selection
	const $newFrom = doc.resolve($from.before())
	const $lastTo = doc.resolve($to.after())
	const pairs: Mutable<Pick<Selection, "$from" | "$to">>[] = [{
		$from: $newFrom,
		$to: $lastTo,
	}]
	let searchedDepth = 0
	let $last = $from
	nodesBetween(doc, { $from, $to }, { shift: -1 }, (node, pos) => {
		if (node?.type === itemType) {
			const $pos = doc.resolve(pos + 1)
			if ($pos.depth < $newFrom.depth - (searchedDepth * 2)) {
				last(pairs).$to = $last
				pairs.push({ $from: $pos, $to: $lastTo })
				searchedDepth++
			}
			$last = $pos
			return false
		}
		return true
	})
	return pairs
}

