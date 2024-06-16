import { NodeType, Slice } from "prosemirror-model"
import { Transform } from "prosemirror-transform"

import { schema } from "@/components/Editor/schema"

/**
 * When pasting or dragging, sometimes, the slice starts with items deeper than the items after it:
 * ```
 * ...
 *  		- C1 // too deep
 * 	- B1 // too deep
 * - A1 // shallowest
 * 	- ...
 * ...
 * ```
 *
 * This will unindent the deeper items at the start until it reaches an item of the shallowest indent:
 * ```
 * - C1
 * - B1
 * - A1 // shallowest
 * 	- ...
 * ```
 * #future - It should be possible to make this slightly smatter, and only unindent if there's truly no space for the items.
 */
export function conform_slice(slice: Slice, drop_level: number, type: NodeType): Slice {
	let first_node = slice.content.firstChild!
	// let levels: number[] = []
	let shallowest!: number
	slice.content.nodesBetween(0, slice.size, node => {
		if (node.type === type) {
			// levels.push(node.attrs.level)
			if (shallowest === undefined || node.attrs.level < shallowest) {
				shallowest = node.attrs.level
			}
		}
		return true
	})
	// let shallowest: number = Math.min(...levels)
	if (first_node.attrs.level !== shallowest) {
		let stop = false
		slice.content.nodesBetween(0, slice.size, node => {
			if (node.type === type && !stop) {
				let level = node.attrs.level
				if (level > shallowest) {
					// levels.splice(levels.indexOf(level), 1)
					node.attrs.level = shallowest
				} else {stop = true}
			}
			return true
		})
	}
	// let deepest!: number = Math.max(...levels)
	// once it's flattened, all the nodes must be "pushed"/offset so that the first node
	// of the slice is the correct level
	let offset = drop_level - shallowest
	let dummy = schema.nodes.dummy.create(undefined, slice.content)
	let dummy_tr = new Transform(dummy)
	dummy.nodesBetween(2, dummy.nodeSize - 2, (node, pos) => {
		if (node.type === type) {
			dummy_tr.setNodeMarkup(pos, undefined, { ...node.attrs, level: (node.attrs.level as number) + offset })
		}
	})
	let new_slice = new Slice(dummy_tr.doc.content, slice.openStart, slice.openEnd)
	return new_slice
}
