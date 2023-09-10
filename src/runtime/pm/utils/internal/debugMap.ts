/* eslint-disable no-console */
import type { Transaction } from "@tiptap/pm/state"

export function debugMap(
	tr: Transaction,
	{
		asTable = true,
		start = 0,
		end = tr.doc.nodeSize - 1,
		collapse = true
	}: {
		asTable?: boolean
		start?: number
		end?: number
		collapse?: boolean

	} = {}
): void {
	console[collapse ? "groupCollapsed" : "group"]("map")
	if (asTable) {
		const table: Record<string, number[]> = {
			before: [],
			after: []
		}
		for (let i = start; i <= end; i++) {
			table.before.push(i)
			table.after.push(tr.mapping.map(i))
		}
		console.table(table)
	} else {
		for (let i = start; i <= end; i++) {
			console.log(i, tr.mapping.map(i))
		}
	}
	console.groupEnd()
}
