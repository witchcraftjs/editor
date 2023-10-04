import { pushIfNotIn } from "@alanscodelog/utils"
import { type Command } from "@tiptap/core"
import { Fragment, type Node, type NodeType, type Schema, Slice } from "prosemirror-model"
import { splitListItem } from "prosemirror-schema-list"
import { Selection, TextSelection } from "prosemirror-state"
import { canJoin, liftTarget, ReplaceAroundStep } from "prosemirror-transform"

import type { StatefulNodeStates } from "../schema/stateful.js"
import { expandSelection } from "../utils/expandSelection.js"
import { getChildChunks } from "../utils/getChildChunks.js"
import { getGroupNodeNames } from "../utils/getGroupNodeNames.js"
import { getTypeByName } from "../utils/getTypeByName.js"
import { debugNode } from "../utils/internal/debugNode.js"
import { mapSelection } from "../utils/mapSelection.js"
import { nodesBetween } from "../utils/nodesBetween.js"
import { splitIntoChunks } from "../utils/splitIntoChunks.js"


type AttributeOptions<T> = WithNode & {
	attributeKey: string
	allowedValues: T[]
}
type WithNode = {
	nodeType: NodeType
	/**
	 * To properly get all the nodes inside the selection of the wanted type/s, we need to know how far they are, depth-wise from the inline selection. The default is -1, the parent node around the text, but sometimes we might want to target nodes farther up.
	 *
	 * ```
	 * ListItem(P(Te|xt))
	 * ^-2      ^-1 ^0
	 * ```
	 *
	 */
	shift?: number

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
			shift = -1,
		}: AttributeOptions<number> &
		WithFallbackNodes
		) => ({
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
			},
	},
	changeAttrs: {
		buttons: [],
		create: () => (
			nodeType: string | undefined,
			attrs: Record<string, any>,
			shift: WithNode["shift"] = -1
		): Command =>
			({ state, tr, dispatch }) => {
				let changed = false
				
				nodesBetween(tr.doc, state.selection, { shift }, (node, pos) => {
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
			shift = -1,
		}: AttributeOptions<string>) => ({
			type,
		}: { type: string }): Command =>
			({ state, tr, dispatch }) => {
				if (!allowedValues.includes(type)) { return false }
				let changed = false
				nodesBetween(tr.doc, state.selection, { shift }, (node, pos) => {
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
			shift = -1,
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
				nodesBetween(tr.doc, editorState.selection, { shift }, (node, pos) => {
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
	/**
	 * Copies/moves an item to be before/after/child of the target item.
	 */
	copyOrMoveListItem: {
		buttons: [[]],
		create: () => (
			itemPos: number,
			moveItemPos: number,
			position: "before" | "after" | "child",
			{
				move,
				listNode,
				itemNode,
			}: {
				move: boolean
				listNode: NodeType
				itemNode: NodeType
			}
		): Command => ({ tr, dispatch, state }) => {
			const $target = tr.doc.resolve(moveItemPos)
			const $item = tr.doc.resolve(itemPos)
			const { from, to } = state.selection
			const itemBefore = $item.before()
			const itemAfter = $item.after()
			const selectionFromOffset = from > itemBefore && from < itemAfter ? state.selection.from - itemBefore : undefined
			const selectionToOffset = to > itemBefore && to < itemAfter ? state.selection.to - itemBefore : undefined

			const deleteItemIfWanted = (): void => {
				if (move) {
					const isLastItem = $item.index(-1) === 0
					const offset = (isLastItem ? 2 : 1)
					tr.delete($item.start() - offset, $item.end() + offset)
				}
			}

			if (position === "after") {
				// the "next" resolved pos
				// could be a child list or a wrapping list
				const nodeAfterIsList = $target.after() + 1 !== $target.after(-1)
				if (!nodeAfterIsList) {
					if (dispatch) {
						const slice = tr.doc.slice($item.start() - 1, $item.end() + 1)
						deleteItemIfWanted()
						tr.replace(tr.mapping.map($target.end()), undefined, slice)
					}
					return true
				} else {
					let start = $target.after()
					let end = $target.end(-1)
					const slice = new Slice(
						Fragment.from([itemNode.create({}), $item.node()]),
						1,
						1,
					)
					if (dispatch) {
						deleteItemIfWanted()
						start = tr.mapping.map(start)
						end = tr.mapping.map(end)
						tr.step(new ReplaceAroundStep(start, end, start, end, slice, slice.size - 1, false))
						if (selectionFromOffset) {
							tr.setSelection(TextSelection.create(
								tr.doc,
									start + 1 + selectionFromOffset,
									selectionToOffset && selectionToOffset + 1 + start
							))
						}
					}
					return true
				}
			}
			if (position === "before") {
				if (dispatch) {
					deleteItemIfWanted()
					const start = tr.mapping.map($target.before(-1))
					tr.insert(start, $item.node())
					if (selectionFromOffset) {
						tr.setSelection(TextSelection.create(
							tr.doc,
									start + selectionFromOffset,
									selectionToOffset && selectionToOffset + start
						))
					}
				}
				return true
			}
			if (position === "child") {
				const nodeAfterIsList = $target.after() + 1 !== $target.after(-1)
				const slice = new Slice(
					Fragment.from([listNode.create({}, $item.node())]),
					0,
					nodeAfterIsList ? 1 : 0,
				)
				if (dispatch) {
					deleteItemIfWanted()
					const start = tr.mapping.map($target.end() + 1)
					const end = nodeAfterIsList
						? tr.mapping.map($target.end() + 2)
						: undefined
					tr.replace(start, end, slice)
					if (selectionFromOffset) {
						tr.setSelection(TextSelection.create(
							tr.doc,
								start + selectionFromOffset + 1,
								selectionToOffset && selectionToOffset + 1 + start
						))
					}
				}
				return true
			}
			return false
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
		create: () =>
			(pos?: number | undefined): Command => ({ state, tr, dispatch }) => {
				if (pos !== undefined) {
					const $pos = tr.doc.resolve(pos)
					const depth = $pos.node(-2).childCount === 1 ? -2 : -1
					if (dispatch) tr.delete($pos.before(depth), $pos.after(depth))
				} else {
					const { $from, $to, from } = state.selection
					const startDepth = $from.node(-2).childCount === 1 ? -2 : -1
					const endDepth = $to.node(-2).childCount === 1 ? -2 : -1
					if (dispatch) {
						tr.delete($from.before(startDepth), $to.after(endDepth))
						// move cursor to previous node
						const newCursor = tr.mapping.map(from) - 1
						tr.setSelection(TextSelection.create(tr.doc, newCursor))
					}
				}
				return true
			},
	},
	indentListItem: {
		buttons: [[]],
		create: (
			itemTypeName: string,
		) => (): Command => ({ state, dispatch, tr, editor }) => {
			const itemType = getTypeByName(editor.schema, itemTypeName)
			const chunks = splitIntoChunks(tr.doc, itemType, state.selection)
			const blockRangeFilter = (node: Node): boolean => node.childCount > 0 && node.firstChild!.type === itemType
			
			let canChange = false
			for (const chunk of chunks) {
				const { $from, $to } = mapSelection(tr, chunk,)
				const range = $from.blockRange($to, blockRangeFilter)
				if (!range) continue
				canChange = true
				const start = range.start
				const end = range.end
				const listType = $from.node(-1).type
				// A
				//		B <- first child of A
				const itemIndex = $from.index(-1)
				const isFirstChild = itemIndex === 0
				// A <- nodebefore
				// B <-
				const nodeBefore = !isFirstChild
					? $from.node(-1).child(itemIndex - 1)
					: undefined
				// A
				// 	B <- nested node before
				// C <-
				const nodeBeforeIsNested = nodeBefore?.lastChild?.type === listType
			

				// item [list [item?]]
				const fragment = Fragment.from(
					itemType.create(
						null,
						Fragment.from(listType.create(
							null,
							Fragment.from(nodeBeforeIsNested ? itemType.create() : null)
						))
					)
				)

				// make sibling of previous by living /item /list /item open
				const startOpen = nodeBeforeIsNested
						? 3
						// just wrap in list
						: isFirstChild
						? 0
						// nest under sibling by leaving /item open
						: 1

				const slice = new Slice(
					fragment,
					startOpen,
					0
				)
				if (dispatch) {
					debugNode(slice, `${slice.openStart}-${slice.openEnd}`)
					tr.step(new ReplaceAroundStep(
					start - startOpen,
					end,
					start,
					end,
					slice,
					isFirstChild ? 2 : 1,
					true
					))
				}
			}
			return canChange
		}
		,
	},
	unindentListItem: {
		buttons: [[]],
		create: (itemTypeName: string) => (): Command => ({ editor, state, dispatch, tr }) => {
			const itemType = getTypeByName(editor.schema, itemTypeName)
			const blockRangeFilter = (node: Node): boolean => node.childCount > 0 && node.firstChild!.type === itemType
			const chunks = splitIntoChunks(tr.doc, itemType, state.selection)
			const finalChunks: typeof chunks = []
			for (const chunk of chunks) {
				const parent = chunk.$from.node(-3)
				// selection chunk is at the top level
				// unindent the children instead
				if (parent === undefined) {
					const children = getChildChunks(tr.doc, itemType, chunk)
					for (const child of children) {
						finalChunks.push(child)
					}
				} else {
					finalChunks.push(chunk)
				}
			}
			let canChange = false
			for (const chunk of finalChunks) {
				const { $from, $to } = mapSelection(tr, chunk)
				const range = $from.blockRange($to, blockRangeFilter)
				if (!range) continue

				if (dispatch) {
					canChange = true
					const target = liftTarget(range)
					if (target === null) continue
					tr.lift(range, target)
					const after = tr.mapping.map(range.end, -1)
					if (canJoin(tr.doc, after)) tr.join(after)
				}
			}
			return canChange
		}
		,
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
					if (dispatch) tr.delete(newFrom.from, to + 1)
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
	toggleBold: {
		buttons: [[]],
		create: () => (): Command => ({ commands }) => commands.toggleMark("bold"),
	},
	toggleItalic: {
		buttons: [[]],
		create: () => (): Command => ({ commands }) => commands.toggleMark("italic"),
	},
	toggleInlineCode: {
		buttons: [[]],
		create: () => (): Command => ({ commands }) => commands.toggleMark("inline-code"),
	},
	toggleCodeBlock: {
		buttons: [[]],
		create: () => (): Command => ({ commands }) => commands.toggleNode("code", "paragraph"),
	},
}
