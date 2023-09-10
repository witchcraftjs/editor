import { type Command, getNodeType } from "@tiptap/core"
import { Fragment, type Node, type NodeType, Slice } from "@tiptap/pm/model"
import { Selection, TextSelection } from "@tiptap/pm/state"

declare module "@tiptap/core" {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		customSetNode: {
			/**
			 * Override's tiptaps' setNode with one that:
			 *
			 * - Handles non-text node conversions.
			 * - Can passed a position.
			 * - Correctly preserves marks (only if allowed by the wanted node type).
			 * - Attempts to preserve the selection, including inside the node.
			 *
			 * Note that if a node does not set it's marks property and it's schema's markSet is null, this function takes it as all marks being allowed.
			 */
			setNode: (
				typeOrName: string | NodeType,
				attributes?: Record<string, any>,
				pos?: number
			) => ReturnType
		}
	}
}

export const setNode = () =>
	(
		typeOrName: string | NodeType,
		attributes = {},
		pos?: number
	): Command => ({ state, tr, dispatch }) => {
		const type = getNodeType(typeOrName, state.schema)

		const $target = tr.doc.resolve(pos ?? tr.selection.from)
		const targetStart = $target.start()
		const targetEnd = $target.end()
		const targetNode = $target.node()

		const selection = tr.selection
		const offsets: { pos: number, offset: number }[] = []
		let newNodeStartOffset = 0
		let oldNodeStartOffset = 0
		/**
		 * When a node is not a text block, we grab all the inline text content,
		 * and stick it into the new node type.
		 */
		if (!type.isTextblock || !targetNode.type.isTextblock) {
			/**
			 * This requires some custom mapping shenanigans.
			 *
			 * TODO: See if we can do this with StepMap instead.
			 * TODO: Extract to a function.
			 *
			 * Basically every time we find a text node, we keep track of the total offset created by the wrapping nodes. So given a target like this:
			 *
			 * ```
			 * target [pos: 0]
			 *  	child [1]
			 *  		text [2]
			 *  	child [3]
			 *  		text [4]
			 * 		[ ...or any various combinations]
			 *
			 * We can think of the positions like this:
			 * ```
			 * 0               1      2             3      4             5
			 * | [ wrappers* ] | Text | [wrappers*] | Text | [wrappers*] |
			 * ```
			 * And using the offset at each position, we can map postions from text nodes like this:
			 * ```
			 * 0 [prev: 1-2] 1 [prev: 3-4] 2
			 * | Text        | Text      |
			 * ````
			 */
			// first we create the node, letting it create any children it needs
			const newNode = type.createAndFill(attributes)
			if (!newNode) return false
			let depth = 1
			let childNode = newNode
			// find the deepest parent that can contain text
			while (childNode.childCount > 0) {
				childNode = childNode.firstChild!
				depth++
				if (childNode.isTextblock) break
			}
			// get the start offset of the text for selection mapping
			newNodeStartOffset = depth
			// we need to know which marks this child accepts, NOT it's parent or root convert type
			const insertNodeType = childNode.type

			// for selection mapping
			let oldNode = targetNode
			depth = 0
			while (oldNode.childCount > 0) {
				oldNode = oldNode.firstChild!
				depth++
				if (oldNode.isTextblock) break
			}
			oldNodeStartOffset = depth

			// map the offsets and capture the nodes
			const nodes: Node[] = []
			let offset = 0
			let lastPos = 0

			targetNode.nodesBetween(0, targetNode.content.size, (node, pos) => {
				if (node.isText) {
					offset += pos - lastPos
					lastPos = pos - node.content.size + 1
					offsets.push({ pos: targetStart + pos, offset: offset - oldNodeStartOffset })
					// create doesn't validate marks
					// so we manually filter out those that aren't allowed
					nodes.push(state.schema.text(
						node.text ?? "",
						insertNodeType.allowedMarks(node.marks)
					))
				}
				return true
			})

			if (newNodeStartOffset === undefined) return false
			const contentNodes = nodes.length > 0 && insertNodeType.isTextblock ? nodes : undefined
			// note that attempting to build the node, even with createAndFill, tends to fail when we pass the contentNodes
			// so they are inserted after instead
			if (dispatch) {
				tr.replace(
					targetStart,
					targetEnd,
					new Slice(Fragment.from(newNode), 0, 0)
				)
				if (contentNodes) {
					tr.insert(targetStart + newNodeStartOffset, contentNodes)
				}
			}
		} else {
			if (dispatch) {
				tr.setBlockType(targetStart, undefined, type, attributes)
			}
		}
		// prevent clearing the document when we change the type of a node
		// without inline content
		// see https://github.com/ueberdosis/tiptap/issues/5490
		if (dispatch) {
			tr.setMeta("preventClearDocument", true)
		}

		// while only changing from a non-text node requires we use offsets
		// this is all done from here for both cases since they might both need to use Selection.findFrom
		// in some rare instances (such as cross cell table selections) we fallback
		// to the mapped positions
		// it's not that we can't map them correctly only that the editor does not have a correct state because they are psuedo selections
		// would have to investigate how to get them properly

		// also findFrom seems to be needed to get a nice selection
		// otherwise the mapped position is often one step after the node which is not what we want

		if (dispatch) {
			const mappedFrom = tr.mapping.map(selection.from)
			const mappedTo = tr.mapping.map(selection.to)

			const wantedFromOffset = offsets.findLast(_ => selection.from >= _.pos)?.offset ?? 0

			const from = selection.from >= targetStart && selection.from <= targetEnd
				? (selection.from - wantedFromOffset + newNodeStartOffset - oldNodeStartOffset)
				: Selection.findFrom(tr.doc.resolve(mappedFrom), -1, true)?.from

			const wantedToOffset = offsets.findLast(_ => selection.to >= _.pos)?.offset ?? 0
			const to = selection.to >= targetStart && selection.to <= targetEnd
				? (selection.to - wantedToOffset + newNodeStartOffset - oldNodeStartOffset)
				: Selection.findFrom(tr.doc.resolve(mappedTo), -1, true)?.to

			tr.setSelection(
				TextSelection.create(
					tr.doc,
					// avoid errors from out of range positions just in case
					// all this position mapping is quite finicky
					from && from > 0 && from < tr.doc.content.size ? from : mappedFrom,
					to && to > 0 && to < tr.doc.content.size ? to : mappedTo
				)
			)
		}

		return true
	}
