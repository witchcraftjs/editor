import { type NodeType, Slice } from "prosemirror-model"
import { Transform } from "prosemirror-transform"

import { schema } from "../schema.js"


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
export function conformSlice(slice: Slice, dropLevel: number, type: NodeType): Slice {
	const firstNode = slice.content.firstChild!
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
	if (firstNode.attrs.level !== shallowest) {
		let stop = false
		slice.content.nodesBetween(0, slice.size, node => {
			if (node.type === type && !stop) {
				const level = node.attrs.level
				if (level > shallowest) {
					// levels.splice(levels.indexOf(level), 1)
					// @ts-expect-error todo
					node.attrs.level = shallowest
				} else {stop = true}
			}
			return true
		})
	}
	// let deepest!: number = Math.max(...levels)
	// once it's flattened, all the nodes must be "pushed"/offset so that the first node
	// of the slice is the correct level
	const offset = dropLevel - shallowest
	const dummy = schema.nodes.dummy.create(undefined, slice.content)
	const dummyTr = new Transform(dummy)
	dummy.nodesBetween(2, dummy.nodeSize - 2, (node, pos) => {
		if (node.type === type) {
			dummyTr.setNodeMarkup(pos, undefined, { ...node.attrs, level: (node.attrs.level as number) + offset })
		}
	})
	const newSlice = new Slice(dummyTr.doc.content, slice.openStart, slice.openEnd)
	return newSlice
}
