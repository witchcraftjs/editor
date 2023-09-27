import type { NodeType } from "prosemirror-model"

import type { SkipFilter } from "../types.js"


/**
 * Creates the skip function for find_down.
 * Unlike when moving up, to search along the start we have to skip any (singular) "ItemContent" nodes when searching down along the start.
 */


export const createSkipNonContainer = (
	itemType: NodeType,
	containerType: NodeType
): SkipFilter =>
	($node, _i, main) => {
		if (![containerType, itemType].includes($node.node().type)) {
			return main.resolve($node.start() + $node.node().nodeSize)
		}
		return undefined
	}
