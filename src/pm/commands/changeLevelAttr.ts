import type { Command } from "@tiptap/core"

import type { CommandAttributeOptions, CommandFallbackNodesOptions } from "../../types.js"
import { addFallbackNodes } from "../utils/internal/addFallbackNodes.js"
import { nodesBetween } from "../utils/nodesBetween.js"


export const changeLevelAttr = ({
	nodeType,
	allowedValues,
	attributeKey,
	fallbackGroups,
	fallbackNodeTypeNames,
	shift = -1,
}: CommandAttributeOptions<number> &
CommandFallbackNodesOptions
) =>
	({
		level,
		onlyHeadings = false,
	}: {
		level: number
		onlyHeadings?: boolean
	}): Command =>
		({ state, tr, dispatch, editor }) => {
			if (!allowedValues.includes(level)) { return false }
			const nodeTypes = addFallbackNodes(
				editor.schema,
				[nodeType.name],
					onlyHeadings ? undefined : { fallbackGroups, fallbackNodeTypeNames }
			)
			let changed = false
							
			nodesBetween(tr.doc, state.selection, { shift }, (node, pos) => {
				if (!node) return false
				if (nodeTypes.includes(node.type.name)) {
					changed = true
					if (dispatch) {
						tr.setNodeMarkup(pos, nodeType, { [`${attributeKey}`]: level })
					}
				}
				return true
			})
			if (!changed) return false
			return true
		}

