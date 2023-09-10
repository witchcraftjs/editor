import { pushIfNotIn } from "@alanscodelog/utils"
import type { Schema } from "@tiptap/pm/model"

import { getGroupNodeNames } from "../getGroupNodeNames.js"

export const createNodeTypesList = (
	schema: Schema,
	mutatedNodeTypes: string[],
	nodeTypeNames?: string[],
	nodeGroups?: string[]
): string[] => {
	if (nodeGroups) {
		pushIfNotIn(
			mutatedNodeTypes,
			getGroupNodeNames(schema, nodeGroups)
		)
	}
	if (nodeTypeNames) {
		pushIfNotIn(
			mutatedNodeTypes,
			nodeTypeNames
		)
	}
	return mutatedNodeTypes
}
