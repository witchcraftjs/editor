import type { Node, ResolvedPos } from "prosemirror-model"
import type { Selection } from "prosemirror-state"

import { findUp } from "./findUp.js"
import { debugNode } from "./internal/debugNode.js"

/** Expands a resolved positions of a selection so that the ends are of the given node types. */
export function expandSelection<T extends Partial<Pick<Selection, "$from" | "$to">>>(doc: Node, { $from, $to }: T, nodeTypesNames: string[]): T {
	let $newFrom: ResolvedPos
	if ($from) {
		const startPos = findUp($from, node => node && nodeTypesNames.includes(node.type.name))
		if (startPos === undefined) {
			$newFrom = $from
		} else {$newFrom = doc.resolve(startPos)}
		console.log({ startPos })
	}
	let $newTo: ResolvedPos
	if ($to) {
		const endPos = findUp($to, node => {
			debugNode(node)
			return node && nodeTypesNames.includes(node.type.name)
		})
		if (endPos === undefined) {
			$newTo = $to
		} else {$newTo = doc.resolve(endPos - 1)}
		console.log({ endPos })
		debugNode($newTo.node(), "", undefined, true, ["size"])
	}
	return { $from: $newFrom!, $to: $newTo! } as T
}
