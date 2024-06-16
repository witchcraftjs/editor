import type { Node } from "prosemirror-model"


export function set_temp(node: Node, key: string, val: any): void {
	node.attrs.temp = node.attrs.temp ?? {}
	node.attrs.temp[key] = val
}
