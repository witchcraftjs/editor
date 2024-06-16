/* eslint-disable prefer-rest-params */
import type { Node, ResolvedPos } from "prosemirror-model"

import type { Filter } from "@/components/Editor/types"


/**
 * Goes through all nodes after a position (pass -1 to go through the node passed as well). Can function similar to nodesBetween if using before option.
 * Can be set to stop with the top option or with a filter function.
*/
export function find_forward(doc: Node, from: number | ResolvedPos = 0, {
	before,
	stop,
	descend = true,
}: {
	descend?: boolean
	before?: number
	stop?: number
} = {}, filter?: Filter): ResolvedPos | undefined {
	let start = typeof from === "number" ? from : from.start()
	let i: { value: number } = arguments[4] ?? { value: 0 }
	let pos: number
	if (start === 0 && arguments[4] === undefined) {
		if ((!filter && stop === i.value)) {
			return doc.resolve(start)
		} else if (filter) {
			let $node = doc.resolve(start)
			pos = $node.start() + 1// fix position just in case
			let res = filter($node, i.value)
			if (res === true) return $node
			i.value += 1
		}
	}
	pos = pos! ?? arguments[5] ?? 1
	let parent = (arguments[6] ?? (doc.content as any)?.content) as Node[]
	for (let child of parent) {
		// if (pos === 6) debugger
		if (child.isText) {
			pos += child.nodeSize
			continue
		}
		if ((!filter && stop === i.value)) {
			return doc.resolve(pos)
		} else if (filter) {
			// @ts-expect-error
			if (pos > doc.nodeSize - 2 || (before !== undefined && pos >= before)) return arguments[4] !== undefined ? false : undefined
			if (pos >= start) {
				let $node = doc.resolve(pos)
				pos = $node.start() // fix position just in case
				let res = filter($node, i.value)
				if (res === true) return $node
				i.value += 1
			}
			let children = (child?.content as any)?.content
			if ((descend || pos < start) && children && !children[0]?.isText) {
				// @ts-expect-error
				let maybe_node = find_forward(doc, start, { stop, before, descend }, filter, i, pos + 1, child.content.content)
				if (maybe_node !== undefined) return maybe_node
			}
		}
		// console.log(pos, child.nodeSize)

		pos += child.nodeSize
	}
	return
}
