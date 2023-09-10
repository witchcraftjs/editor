import { type Command, getNodeType } from "@tiptap/core"

import type { CommandAttributeOptions, CommandToggleNodesOptions } from "../../../../types/index.js"
import { findUpwards } from "../../../utils/findUpwards.js"
import { createNodeTypesList } from "../../../utils/internal/createNodeTypesList.js"

declare module "@tiptap/core" {

	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		changeLevelAttr: {
			changeLevelAttr: (opts: {
				level: number
				onlyHeading: boolean
			}, pos?: number) => ReturnType
		}
	}
}

export const changeLevelAttr = ({
	nodeType,
	allowedValues,
	attributeKey,
	toggleGroups,
	toggleNodeTypeNames
}: CommandAttributeOptions<number>
	& CommandToggleNodesOptions
) =>
	({
		level,
		onlyHeadings = false
	}: {
		level: number
		onlyHeadings?: boolean
	}, pos?: number): Command =>
		({ state, commands, tr, editor }) => {
			if (!allowedValues.includes(level)) { return false }
			const nodeTypes = createNodeTypesList(
				editor.schema,
				[nodeType],
				onlyHeadings ? undefined : toggleNodeTypeNames,
				onlyHeadings ? undefined : toggleGroups
			)
			const nodeTypeType = getNodeType(nodeType, editor.schema)
			const from = pos ?? state.selection.map(tr.doc, tr.mapping).from

			const nodePos = findUpwards(tr.doc, from, $pos => {
				if (nodeTypes.includes($pos.node().type.name)) {
					return true
				}
				return false
			})?.$pos?.pos
			if (!nodePos) return false
			return commands.setNode(nodeTypeType, { [`${attributeKey}`]: level }, nodePos - 1)
		}
