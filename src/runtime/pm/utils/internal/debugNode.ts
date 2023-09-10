/* eslint-disable no-console */
import { type Fragment, type Node, ResolvedPos, type Slice } from "@tiptap/pm/model"

import { recurse } from "./recurse.js"

export function debugNode(
	doc?: Slice | Fragment | ResolvedPos | Node | null | undefined,
	title?: string | number,
	collapse: boolean = true,
	deep: boolean = true,
	props: ("size" | "is" | "attrs")[] = ["size"]
): void {
	if (doc instanceof ResolvedPos) { doc = doc.node() }

	const d = doc as any
	const isSlice = d?.constructor?.name === "Slice"
	const isFragment = d?.constructor?.name === "Fragment"

	const message = !doc
		? "UNDEFINED"
		: isSlice
			? (`[[${d.content.content.map((node: Node) => recurse(node, deep, props) ?? "").join("]\n[")}]]`)
			: isFragment
				? (`[[${d.content.map((node: Node) => recurse(node, deep, props) ?? "").join("]\n[")}]]`)
				: recurse(d, deep, props)
	console[collapse ? "groupCollapsed" : "group"](
		title !== undefined ? title.toString() : "",
		message !== "UNDEFINED"
			? isSlice || isFragment
				? "Slice"
				: message.split("\n")[0]
			: message
		// new Error().stack?.split("\n")[2],
	)
	console.log(message)
	console.groupEnd()
	// console.log(JSON.stringify(recurse(doc), null, "\t"))
}
