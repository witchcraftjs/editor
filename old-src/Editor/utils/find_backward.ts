/* eslint-disable prefer-rest-params */
import type { Node, ResolvedPos } from "prosemirror-model"

import type { Filter } from "@/components/Editor/types"

/**
 * Like find_forward but backwards.
*/
export function find_backward(doc: Node, from: number | ResolvedPos = doc.content.size, {
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
	if (start === doc.content.size && arguments[4] === undefined) {
		if ((!filter && stop === i.value)) {
			return doc.resolve(start)
		} else if (filter) {
			let $node = doc.resolve(start)
			pos = $node.end() - 1 // fix position just in case
			let res = filter($node, i.value)
			if (res === true) return $node
			i.value += 1
		}
	}
	pos = pos! ?? arguments[5] ?? doc.content.size - 1
	let parent = (arguments[6] ?? (doc.content as any)?.content) as Node[]
	for (let loopi = parent.length - 1; loopi >= 0; loopi--) {
		let child = parent[loopi]
		if (child.isText) {
			pos -= child.nodeSize
			continue
		}
		// @ts-expect-error
		if (pos < 0 || (before !== undefined && pos >= before)) return arguments[4] !== undefined ? false : undefined
		if (pos <= start) {
			let $node = doc.resolve(pos)
			pos = $node.end() - 1 // fix position just in case
			if (!filter && stop! >= i.value) {
				return $node
			} else if (filter) {
				let res = filter($node, i.value)
				if (res === true) return $node
			}
			if (!filter && stop! >= i.value) return
			i.value += 1
		}
		let children = (child?.content as any)?.content

		if ((descend || pos > start) && children && !children[0]?.isText) {
			// @ts-expect-error
			let maybe_node = find_backward(doc, start, { stop, before, descend }, filter, i, pos - 1, child.content.content)
			if (maybe_node !== undefined) return maybe_node
		}
		pos -= child.nodeSize
	}
	return
}
