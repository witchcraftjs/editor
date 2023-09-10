import { type Node, NodeType, type ResolvedPos } from "prosemirror-model"
import { type Command, TextSelection, type Transaction } from "prosemirror-state"

import { PARENT } from "../types.js"
// import { type Command, type Dispatch, PARENT } from "@/components/Editor/types"
import { findUp } from "../utils/findUp.js"


export const enter = ({
	splittable,
	ignore,
	fallback,
	parent,
	cache = true,
	override,
	parentFallbackInsertAfter = false,
}: {
	/** Node types that can be split. If a node is not in this list but is not ignored, the fallback type will be inserted. If the cursor was at the start of the node, it will be inserted before, otherwise after and the selection changed to point to it's start position. */

	splittable?: NodeType[]
	/** Node types to ignore completely.*/

	ignore?: NodeType[]
	fallback?: NodeType
	/**
	 * If we're in a node that is not splittable and has a fallback and the selection is not at the start (i.e. we're inserting a node *after*), if we're splitting it's parent, whether we should insert the new item right after the node (taking any other siblings the parent might have had) or inserting it after the end of the parent.
	 *
	 * ```js
	 * Parent
	 * 	Chi|ld // not-splittable
	 * 	// ^ cursor (could be anywhere from pos 1 relative to Child to the end of Child)
	 * 	Sibling // might look like children to a user, e.g. ul if parent is li and Child is p
	 * Parent Sibling
	 *
	 * // parent_fallback_insert_after = true
	 * Parent
	 * 	Child
	 * 	Sibling
	 * |New Parent Sibling
	 * 	Child // fallback
	 *
	 * // parent_fallback_insert_after = false
	 * Parent
	 * 	Child
	 * |New Parent Sibling
	 * 	Child // fallback
	 * 	Sibling
	 * ```
	 *
	 * Note: The types being matched against for `ignore`/`splittable` are still those of the node the selection came from.
		*/
	parentFallbackInsertAfter?: boolean
	/** If parent is defined this will attempt to split the node at the parent's level. Parent can be a single type (e.g. you have one global block type) or it can be an object keyed by node type names and the corresponding parent type to search for. The parent can be as many levels up as you want, the function will auto find the distance and cache it (pass `cache:false` to disable it if the distance might vary). */

	parent?: NodeType | Record<string, NodeType>
	/** Override the type of the inserted node (or if split, the latter half). Can be overridden for all nodes, or per node by passing an object keyed by node type name and the overriding type to use. For example, this can make it so that hitting enter in a heading does not create another heading but a paragraph instead. */

	override?: NodeType | Record<string, NodeType>
	/** When using the `parent` option, cache the distances to the parent node. Note the cache will not work unless you use the same command instance returned. For example, if you're handling keyboard events yourself and call `enter()` in the event handler, you're creating a new instance each time. Instead create/configure it once then re-use it. */

	cache?: boolean
} = {}): Command => {
	const distanceCache: Record<string, number> = {}
	return ((state, dispatch) => {
		const tr = state.tr
		const { from, to } = tr.selection
		if (from !== to) {
			tr.delete(from, to)
		}
		const { $from: $pos } = tr.selection
		const selectionIsAtStart = $pos.parentOffset === 0
		// let node_empty = ($pos.parent?.nodeSize - 2) === 0

		const node = $pos.node()
		if (ignore?.includes(node.type)) return false

		const overrideType = override instanceof NodeType
			? override
			: typeof override === "object"
			? override[node.type.name]
			: undefined

		if (splittable?.includes(node.type)) {
			if (parent !== undefined && !selectionIsAtStart) {
				const parentType = parent instanceof NodeType
					? parent
					: parent[node.type.name]
				const distance = getDistance(tr, $pos, parentType, distanceCache, cache)
				if (distance === undefined) return false
				tr.split($pos.pos, distance)
			} else {
				if (selectionIsAtStart) {
					tr.insert($pos.pos - 1, [overrideType ? overrideType.createAndFill()! : node.type.createAndFill()!])
				} else {
					tr.split($pos.pos, 1, overrideType && [{ type: overrideType }])
				}
			}
		} else {
			let split = false
			let start = $pos.start() - 1
			let end = $pos.end()
			if (!fallback) throw new Error(`Missing fallback for node of type ${node.type.name}`)
			let content: Node | null | undefined = fallback.createAndFill()
			if (!content) return false
			let offset = 0
			if (parent !== undefined) {
				const parentType = parent instanceof NodeType
					? parent
					: parent[node.type.name]
				content = parentType.createAndFill()
				if (!content) return false

				if (!selectionIsAtStart) {
					const distance = getDistance(tr, $pos, parentType, distanceCache, cache)
					if (distance === undefined) return false
					if (!parentFallbackInsertAfter) {
						const types: NodeType[] = [content.type]
						content.nodesBetween(0, content.nodeSize - 2, existing => {
							if (overrideType && existing.type === node.type) {
								types.push(overrideType)
							} else {
								types.push(existing.type)
							}
							return true
						})

						tr.split(end, distance, types.map(type => ({ type })))
						tr.setSelection(TextSelection.create(tr.doc, end + 2 + (content?.nodeSize / 2)))
						split = true
					} else {
						const $parent = tr.doc.resolve($pos.before($pos.depth - distance + 2))
						end = $parent.end()
						offset = content.nodeSize
					}
				} else {
					start -= ((content?.nodeSize / 2) - 1)
					offset = content?.nodeSize * 1.5
				}
			} else {
				offset = (selectionIsAtStart ? content.nodeSize : 1) + 1
			}
			if (!split) {
				const insertPos = selectionIsAtStart
					? start
					: end

				tr.insert(insertPos, content)
				tr.setSelection(TextSelection.create(tr.doc, insertPos + offset))
			}
		}
		dispatch(tr)

		return true
	}) satisfies Command
}

function getDistance(tr: Transaction, $pos: ResolvedPos, parentType: NodeType, distanceCache: Record<string, number>, cache: boolean): number | undefined {
	let distance = distanceCache[parentType.name]
	if (distance === undefined) {
		distance = 1
		const $found = findUp(tr.doc, $pos, { start: PARENT }, $node => {
			distance++
			return $node.node().type === parentType
		})
		if (!$found) return
		if (cache) distanceCache[parentType.name] = distance
	} else {
		// used cache, check this node exists this far up
		const $parent = tr.doc.resolve($pos.before($pos.depth - distance + 2))
		if (!$parent) return
		if ($parent.node().type !== parentType) {
			throw new Error(`Parent of type ${$parent.node().type.name} found at cached distance ${distance} is not of the correct type ${parentType.name}.`)
		}
	}
	return distance
}
