import { pushIfNotIn } from "@alanscodelog/utils"
import type { Command } from "@tiptap/core"
import type { NodeType, Schema } from "prosemirror-model"
import { splitListItem } from "prosemirror-schema-list"
import { Selection } from "prosemirror-state"

import type { StatefulNodeStates } from "../schema/stateful.js"
import { expandSelection } from "../utils/expandSelection.js"
import { getGroupNodeNames } from "../utils/getGroupNodeNames.js"
import { debugNode } from "../utils/internal/debugNode.js"
import { nodesBetween } from "../utils/nodesBetween.js"


type AttributeOptions<T> = WithNode & {
	attributeKey: string
	allowedValues: T[]
}
type WithNode = {
	nodeType: NodeType
}
type WithFallbackNodes = {
/** If specified, nodes in these groups will be converted to the given nodeType. */
	fallbackGroups?: string[]
	/** Like fallbackGroups but for specific nodes. */
	fallbackNodeTypeNames?: string[]
}
const addFallbacks = (
	schema: Schema,
	mutatedNodeTypes: string[],
	{ fallbackGroups, fallbackNodeTypeNames }: WithFallbackNodes = {}
): string[] => {
	if (fallbackGroups) pushIfNotIn(mutatedNodeTypes, ...getGroupNodeNames(schema, fallbackGroups))
	if (fallbackNodeTypeNames) pushIfNotIn(mutatedNodeTypes, ...fallbackNodeTypeNames)
	return mutatedNodeTypes
}
export const rawCommands = {

	changeLevelAttr: {
		// todo find a better way to do this, mayber create returns {command, buttons}?
		// but then how to pass from tip tap config to commands component...
		// i think we can extract the options from the tip tap nodes created, and create "buttons" from those
		buttons: [0, 1, 2, 3, 4, 5, 6].map(_ => [{ level: _ }]),
		create: ({
			nodeType,
			allowedValues,
			attributeKey,
			fallbackGroups,
			fallbackNodeTypeNames,
			shift,
		}: AttributeOptions<number> &
		WithFallbackNodes &
		{

			/**
			 * If the nodeType and fallback nodes are always the same distance from the inline selection, this tells the command how much to shift the selection "up"/"around" to include the nodes.
			 * Should be in negative numbers (-1 is the parent, -2 is the grandparent and so forth.)
			 * If this is not specified the command will search up the ends until it finds nodes of the given types, otherwise it will use the original selection. But this is more expensive.
			 */
			shift?: number
		}) => ({
			level,
			onlyHeadings = false,
		}: { level: number, onlyHeadings?: boolean }): Command =>
			({ state, tr, dispatch, editor }) => {
				if (!allowedValues.includes(level)) { return false }
				const nodeTypes = addFallbacks(
					editor.schema,
					[nodeType.name],
					onlyHeadings ? undefined : { fallbackGroups, fallbackNodeTypeNames }
				)
				let changed = false
				const selectionAroundNodes = shift
					? state.selection
					: expandSelection(tr.doc, state.selection, nodeTypes)
			
				nodesBetween(tr, selectionAroundNodes, { shift }, (node, pos) => {
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
			},
	},
	changeAttrs: {
		buttons: [],
		create: () => (nodeType: string | undefined, attrs: Record<string, any>): Command =>
			({ state, tr, dispatch }) => {
				let changed = false
				nodesBetween(tr, state.selection, { shift: -1 }, (node, pos) => {
					if (node?.type?.name === nodeType) {
						changed = true
						if (dispatch) {
							tr.setNodeMarkup(pos, undefined, attrs)
						}
					}
					return true
				})
				if (!changed) return false
				return true
			},
	},
	changeTypeAttr: {
		buttons: [[]],
		create: ({
			nodeType,
			allowedValues,
			attributeKey,
		}: AttributeOptions<string>) => ({
			type,
		}: { type: string }): Command =>
			({ state, tr, dispatch }) => {
				if (!allowedValues.includes(type)) { return false }
				let changed = false
				nodesBetween(tr, state.selection, { shift: -1 }, (node, pos) => {
					if (node?.type === nodeType) {
						changed = true
						if (dispatch) {
							tr.setNodeAttribute(pos, attributeKey, type)
						}
					}
					return true
				})
				if (!changed) return false
				return true
			},
	},
	changeListItemType: {
		buttons: [
			{ type: "none" },
			{ type: "stateful-task", state: "unchecked" },
			{ type: "stateful-task", state: "partial" },
			{ type: "stateful-task", state: "cancelled" },
			{ type: "stateful-task", state: "checked" },
			{ type: "ordered" },
			// todo list all list-style-types
			{ type: "unordered" },
			{ type: "ordered-upper-roman" },
			{ type: "ordered-lower-roman" },
			// "unordered-square",
		].map(_ => [_]),
		create: ({
			nodeType,
			allowedValues,
			allowedStates,
			stateAttributeKey,
			attributeKey,
		}:
		AttributeOptions<string> & {
			allowedStates: StatefulNodeStates
			stateAttributeKey: string
		}) => ({
			type,
			state,
		}: { type: string, state?: string }): Command =>
			({ state: editorState, tr, dispatch }) => {
				if (!allowedValues.includes(type)) { return false }
				let changed = false
				nodesBetween(tr, editorState.selection, { shift: -1 }, (node, pos) => {
					if (node?.type === nodeType) {
						changed = true
						if (dispatch) {
							tr.setNodeAttribute(pos, attributeKey, type)
							if (type.startsWith("stateful-")) {
								const statefulType = type.slice(type.indexOf("-") + 1)
								const stateEntry = allowedStates[statefulType]
								if (stateEntry !== undefined) {
									const newState = state !== undefined
											? state
											// recover retained state
											: ((node as any).state ?? stateEntry.default)
									tr.setNodeAttribute(pos, stateAttributeKey, newState)
								}
							} // else let it silently retain it's state ?
						}
					}
					return true
				})
				if (!changed) return false
				return true
			},
	},
	enter: {
		buttons: [[]],
		create: (nodeType: NodeType) => (): Command => ({ state, dispatch, view }) => splitListItem(nodeType)(state, dispatch, view),

	},
	deleteSelection: {
		buttons: [[]],
		create: () => (): Command => ({ state, tr, dispatch }) => {
			const { from, to } = state.selection
			if (from !== to) {
				if (dispatch) tr.delete(from, to)
				return true
			}
			return false
		},
	},
	deleteNodes: {
		buttons: [[]],
		create: (opts: WithNode & WithFallbackNodes) => (): Command => ({ state, tr, editor, dispatch }) => {
			const nodeTypes = addFallbacks(
				editor.schema,
				[opts.nodeType.name],
				opts
			)
			const { $from, $to } = expandSelection(tr.doc, state.selection, nodeTypes)
			if (dispatch) tr.delete($from.start(), $to.end())
			return true
		},
	},
	backspace: {
		buttons: [[]],
		create: () => (): Command => ({ state, tr, commands, dispatch }) => {
			const { from, to, $from } = state.selection


			if (from === to) {
				// we're at the start of a block an must "joinBackwards"
				if ($from.start() === from) {
					const newFrom = Selection.findFrom(state.doc.resolve(from - 1), -1, true)
					if (!newFrom) return false
					if (dispatch) tr.delete(newFrom.from, to)
					return true
				} else {
					if (dispatch) tr.delete(from - 1, to)
					return true
				}
			} else {
				return commands.deleteSelection()
			}
		}
		,
	},
	historyUndo: {
		buttons: [[]],
		create: () => (): Command => ({ commands }) => commands.undo(),
	},
	historyRedo: {
		buttons: [[]],
		create: () => (): Command => ({ commands }) => commands.redo(),
	},
}
