import type { Node } from "prosemirror-model"


export function clearTemp<T extends Node>(main: T): T {
	main.nodesBetween(0, main.nodeSize - 2, node => {
		// @ts-expect-error todo
		delete node.attrs.temp
	})
	return main
}
