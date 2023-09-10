/* eslint-disable prefer-rest-params */
import type { Node, ResolvedPos } from "prosemirror-model"

import type { Filter } from "../types.js"


/**
 * Like findForward but backwards.
 */
export function findBackward(doc: Node, from: number | ResolvedPos = doc.content.size, {
	before,
	stop,
	descend = true,
}: {
	descend?: boolean
	before?: number
	stop?: number
} = {}, filter?: Filter): ResolvedPos | undefined {
	const start = typeof from === "number" ? from : from.start()
	// todo
	const i: { value: number } = arguments[4] ?? { value: 0 }
	let pos: number
	if (start === doc.content.size && arguments[4] === undefined) {
		if ((!filter && stop === i.value)) {
			return doc.resolve(start)
		} else if (filter) {
			const $node = doc.resolve(start)
			pos = $node.end() - 1 // fix position just in case
			const res = filter($node, i.value)
			if (res === true) return $node
			i.value += 1
		}
	}
	pos = pos! ?? arguments[5] ?? doc.content.size - 1
	const parent = (arguments[6] ?? (doc.content as any)?.content) as Node[]
	for (let loopi = parent.length - 1; loopi >= 0; loopi--) {
		const child = parent[loopi]
		if (child.isText) {
			pos -= child.nodeSize
			continue
		}
		// @ts-expect-error todo
		if (pos < 0 || (before !== undefined && pos >= before)) return arguments[4] !== undefined ? false : undefined
		if (pos <= start) {
			const $node = doc.resolve(pos)
			pos = $node.end() - 1 // fix position just in case
			if (!filter && stop! >= i.value) {
				return $node
			} else if (filter) {
				const res = filter($node, i.value)
				if (res === true) return $node
			}
			if (!filter && stop! >= i.value) return
			i.value += 1
		}
		const children = (child?.content as any)?.content

		if ((descend || pos > start) && children && !children[0]?.isText) {
			// @ts-expect-error todo
			const maybeNode = findBackward(doc, start, { stop, before, descend }, filter, i, pos - 1, children)
			if (maybeNode !== undefined) return maybeNode
		}
		pos -= child.nodeSize
	}
	return undefined
}
