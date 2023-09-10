import { unreachable } from "@alanscodelog/utils/unreachable"
import { getNodeType } from "@tiptap/core"
import type { NodeType, Schema } from "@tiptap/pm/model"
import type { Transaction } from "@tiptap/pm/state"

import { cleanupFileLoaderNode } from "./cleanupFileLoaderNode.js"

/**
 * Removes all `fileLoader` nodes from the document.
 *
 * Searches up parent wrappers of the given `wrappingTypes`. If any exist and have no other children, they are removed.
 */
export function cleanupFileLoaderNodes(
	tr: Transaction,
	schema: Schema,
	fileLoaderTypeOrName: string | NodeType,
	wrappingTypesOrNames: (string | NodeType)[],
	replaceTypeOrName: string | NodeType,
	callback: typeof cleanupFileLoaderNode = cleanupFileLoaderNode
): Transaction {
	const fileLoaderType = getNodeType(fileLoaderTypeOrName, schema)
	const wrappingTypes = wrappingTypesOrNames.map(_ => getNodeType(_, schema))
	const replaceType = getNodeType(replaceTypeOrName, schema)
	const positions: number[] = []
	tr.doc.descendants((node, pos) => {
		if (node.type === fileLoaderType) {
			positions.push(pos)
		}
	})
	// reversed so that we don't need to map positions
	// and also so we delete the deepest nodes first
	// giving a chance for parents to be completely deleted
	for (const pos of positions.reverse()) {
		const mappedPos = tr.mapping.map(pos)
		// todo remove
		if (mappedPos !== pos) unreachable()
		callback(tr, mappedPos, fileLoaderType, wrappingTypes, replaceType)
	}
	tr.setMeta("preventClearDocument", true)
	tr.setMeta("addToHistory", false)
	return tr
}
