import { Node, NodeType, ResolvedPos } from "prosemirror-model"
import { EditorState, TextSelection, Transaction } from "prosemirror-state"

import { Command, Dispatch, PARENT } from "@/components/Editor/types"
import { find_up } from "@/components/Editor/utils"


/**
 *
 * @param opts
 * @param opts.splittable Node types that can be split. If a node is not in this list but is not ignored, the fallback type will be inserted. If the cursor was at the start of the node, it will be inserted before, otherwise after and the selection changed to point to it's start position.
 * @param opts.ignore Node types to ignore completely.
 * @param opts.override Override the type of the inserted node (or if split, the latter half). Can be overridden for all nodes, or per node by passing an object keyed by node type name and the overriding type to use. For example, this can make it so that hitting enter in a heading does not create another heading but a paragraph instead.
 * @param opts.parent If parent is defined this will attempt to split the node at the parent's level. Parent can be a single type (e.g. you have one global block type) or it can be an object keyed by node type names and the corresponding parent type to search for. The parent can be as many levels up as you want, the function will auto find the distance and cache it (pass `cache:false` to disable it if the distance might vary).
 * @param opts.parent_fallback_insert_after If we're in a node that is not splittable and has a fallback and the selection is not at the start (i.e. we're inserting a node *after*), if we're splitting it's parent, whether we should insert the new item right after the node (taking any other siblings the parent might have had) or inserting it after the end of the parent.
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
 * @param opts.cache When using the `parent` option, cache the distances to the parent node. Note the cache will not work unless you use the same command instance returned. For example, if you're handling keyboard events yourself and call `enter()` in the event handler, you're creating a new instance each time. Instead create/configure it once then re-use it.
 */
export const enter = ({
	splittable,
	ignore,
	fallback,
	parent,
	cache = true,
	override,
	parent_fallback_insert_after = false,
}: {
	splittable?: NodeType[]
	ignore?: NodeType[]
	fallback?: NodeType
	parent_fallback_insert_after?: boolean
	parent?: NodeType | Record<string, NodeType>
	override?: NodeType | Record<string, NodeType>
	cache?: boolean
} = {}): Command => {
	const distance_cache: Record<string, number> = {}
	return (state: EditorState, dispatch: Dispatch): boolean => {
		let tr = state.tr
		let { from, to } = tr.selection
		if (from !== to) {
			tr.delete(from, to)
		}
		let { $from: $pos } = tr.selection
		let selection_is_at_start = $pos.parentOffset === 0
		// let node_empty = ($pos.parent?.nodeSize - 2) === 0

		let node = $pos.node()
		if (ignore?.includes(node.type)) return false

		let override_type = override instanceof NodeType
			? override
			: typeof override === "object"
			? override[node.type.name]
			: undefined

		if (splittable?.includes(node.type)) {
			if (parent !== undefined && !selection_is_at_start) {
				let parent_type = parent instanceof NodeType
					? parent
					: parent[node.type.name]
				let distance = get_distance(tr, $pos, parent_type, distance_cache, cache)
				if (distance === undefined) return false
				tr.split($pos.pos, distance)
			} else {
				if (selection_is_at_start) {
					tr.insert($pos.pos - 1, [override_type ? override_type.createAndFill()! : node.type.createAndFill()!])
				} else {
					tr.split($pos.pos, 1, override_type && [{ type: override_type }])
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
				let parent_type = parent instanceof NodeType
					? parent
					: parent[node.type.name]
				content = parent_type.createAndFill()
				if (!content) return false

				if (!selection_is_at_start) {
					let distance = get_distance(tr, $pos, parent_type, distance_cache, cache)
					if (distance === undefined) return false
					if (!parent_fallback_insert_after) {
						let types: NodeType[] = [content.type]
						content.nodesBetween(0, content.nodeSize - 2, existing => {
							if (override_type && existing.type === node.type) {
								types.push(override_type)
							} else {
								types.push(existing.type)
							}
							return true
						})

						tr.split(end, distance, types.map(type => ({ type })))
						tr.setSelection(TextSelection.create(tr.doc, end + 2 + (content?.nodeSize / 2)))
						split = true
					} else {
						let $parent = tr.doc.resolve($pos.before($pos.depth - distance + 2))
						end = $parent.end()
						offset = content.nodeSize
					}
				} else {
					start -= ((content?.nodeSize / 2) - 1)
					offset = content?.nodeSize * 1.5
				}
			} else {
				offset = (selection_is_at_start ? content.nodeSize : 1) + 1
			}
			if (!split) {
				let insert_pos = selection_is_at_start
					? start
					: end

				tr.insert(insert_pos, content)
				tr.setSelection(TextSelection.create(tr.doc, insert_pos + offset))
			}
		}
		dispatch(tr)

		return true
	}
}

function get_distance(tr: Transaction, $pos: ResolvedPos, parent_type: NodeType, distance_cache: Record<string, number>, cache: boolean): number | void {
	let distance = distance_cache[parent_type.name]
	if (distance === undefined) {
		distance = 1
		let $found = find_up(tr.doc, $pos, { start: PARENT }, $node => {
			distance++
			return $node.node().type === parent_type
		})
		if (!$found) return
		if (cache) distance_cache[parent_type.name] = distance
	} else {
		// used cache, check this node exists this far up
		let $parent = tr.doc.resolve($pos.before($pos.depth - distance + 2))
		if (!$parent) return
		if ($parent.node().type !== parent_type) {
			throw new Error(`Parent of type ${$parent.node().type.name} found at cached distance ${distance} is not of the correct type ${parent_type.name}.`)
		}
	}
	return distance
}
