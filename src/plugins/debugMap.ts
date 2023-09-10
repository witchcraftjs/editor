/* eslint-disable no-console */
import type { Transaction } from "prosemirror-state"


export function debugMap(tr: Transaction, collapse: boolean = true): void {
	console[collapse ? "groupCollapsed" : "group"]("map")
	let i = 0
	while (i < tr.doc.nodeSize - 2) {
		console.log(i, tr.mapping.map(i))
		i++
	}
	console.groupEnd()
}
