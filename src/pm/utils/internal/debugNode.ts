/* eslint-disable no-console */
import { type Fragment, type Node, ResolvedPos, type Slice } from "prosemirror-model"

import { recurse } from "./recurse.js"


export function debugNode(
	doc?: Slice | Fragment | ResolvedPos | Node | null | undefined | void,
	title?: string | number,
	collapse: boolean = true,
	deep: boolean = true,
	props: ("size" | "is" | "attrs")[] = ["size"]
): void {
	if (doc instanceof ResolvedPos) { doc = doc.node() }
	const isSlice = (doc as any)?.constructor?.name === "Slice"
	const isFragment = (doc as any)?.constructor?.name === "Fragment"

	const message = !doc
	? "UNDEFINED"
		: isSlice
			? (`[[${(doc as any).content.content.map((node: Node) => recurse(node, deep, props) ?? "").join("]\n[")}]]`)
			: isFragment
		? (`[[${(doc as any).content.map((node: Node) => recurse(node, deep, props) ?? "").join("]\n[")}]]`)
		: recurse(doc as any, deep, props)
	console[collapse ? "groupCollapsed" : "group"](
		title !== undefined ? title.toString() : "",
		message !== "UNDEFINED"
			? isSlice || isFragment
			? "Slice"
			: message.split("\n")[0] : message,
		// new Error().stack?.split("\n")[2],
	)
	console.log(message)
	console.groupEnd()
	// console.log(JSON.stringify(recurse(doc), null, "\t"))
}
// @ts-expect-error todo
window.debug = debugNode
