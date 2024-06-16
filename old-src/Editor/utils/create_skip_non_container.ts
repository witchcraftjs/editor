import type { NodeType } from "prosemirror-model"

import type { SkipFilter } from "@/components/Editor/types"


/**
 * Creates the skip function for find_down.
 * Unlike when moving up, to search along the start we have to skip any (singular) "ItemContent" nodes when searching down along the start.
 */


export function create_skip_non_container(item_type: NodeType, container_type: NodeType): SkipFilter {
	return ($node, _i, main) => {
		if (![container_type, item_type].includes($node.node().type)) {
			return main.resolve($node.start() + $node.node().nodeSize)
		}
		return
	}
}
