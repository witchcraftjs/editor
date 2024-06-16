import { pushIfNotIn } from "@alanscodelog/utils"

import { getGroupNodeNames } from "../getGroupNodeNames.js"


export const addFallbackNodes = (
	schema: Schema,
	mutatedNodeTypes: string[],
	{ fallbackGroups, fallbackNodeTypeNames }: CommandFallbackNodesOptions = {}
): string[] => {
	if (fallbackGroups) {
		pushIfNotIn(
			mutatedNodeTypes,
			...getGroupNodeNames(schema, fallbackGroups)
		)
	}
	if (fallbackNodeTypeNames) {
		pushIfNotIn(
			mutatedNodeTypes,
			...fallbackNodeTypeNames
		)
	}
	return mutatedNodeTypes
}
	
