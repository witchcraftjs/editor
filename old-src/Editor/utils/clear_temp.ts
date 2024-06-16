import type { Node } from "prosemirror-model"


export function clear_temp<T extends Node>(main: T): T {
	main.nodesBetween(0, main.nodeSize - 2, node => {
		delete node.attrs.temp
	})
	return main
}
