/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable no-console */
import { Fragment, Node, ResolvedPos, Slice } from "prosemirror-model"

import { recurse } from "./recurse"


export function debug_node(doc?: Slice | Fragment | ResolvedPos | Node | null | undefined | void, title?: string | number, collapse = true, deep = true, props: ("size" | "is" | "attrs")[] = []): void {
	if (doc instanceof ResolvedPos) { doc = doc.node() }
	let is_slice = (doc as any)?.constructor?.name === "Slice"
	let is_fragment = (doc as any)?.constructor?.name === "Fragment"

	let message = !doc
	? "UNDEFINED"
		: is_slice
			? (`[[${(doc as any).content.content.map((node: Node) => recurse(node, deep, props) ?? "").join("]\n[")}]]`)
			: is_fragment
		? (`[[${(doc as any).content.map((node: Node) => recurse(node, deep, props) ?? "").join("]\n[")}]]`)
		: recurse(doc as any, deep, props)
	console[collapse ? "groupCollapsed" : "group"](
		title !== undefined ? title.toString() : "",
		message !== "UNDEFINED"
			? is_slice || is_fragment
			? "Slice"
			: message.split("\n")[0] : message,
		// new Error().stack?.split("\n")[2],
	)
	console.log(message)
	console.groupEnd()
	// console.log(JSON.stringify(recurse(doc), null, "\t"))
}
// @ts-expect-error
window.debug = debug_node
