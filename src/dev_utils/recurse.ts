import type { Node } from "prosemirror-model"


export function recurse(node: Node, deep = true, props: ("size" | "is" | "attrs")[] = [], depth = 0): string {
	let obj: any = {}
	let text = []

	text.push(`=${node?.type?.name ?? "unknown"} ${node.firstChild?.textContent as string}`)
	if (node.textContent !== "" && node.isText) {text.push(`"${node.textContent}"`)}
	if (props.includes("size")) {text.push(node.nodeSize)}
	if (props.includes("is")) {
		obj.isBlock = node.isBlock
		obj.isInline = node.isInline
		obj.isLeaf = node.isLeaf
		obj.isText = node.isText
		obj.isTextblock = node.isTextblock
		obj.isAtom = node.isAtom
	}
	if (props.includes("attrs")) {
		obj.attrs = node.attrs
	}
	let content = (node.content as any).content as Node[]
	if (content && content.length > 0) {
		if (deep) {
			obj.children = `\n${Object.values(content).map((node_inner: Node) => recurse(node_inner, deep, props, depth + 1)).join("\n")}`
		} else {
			obj.children = `[${content.length}]`
		}
	}
	let indent = "\t".repeat(depth)
	let top = text.length > 0 ? indent + text.join(`\n${indent}`) : ""
	let bottom_content = Object.entries(obj).map(([key, val]) => key === "children"
		? `${indent}${val as string}`
		: key === "attrs"
			? `${val ? indent + (Object.keys(val as any).length > 0 ? JSON.stringify(val) : "")/* attrs_to_classes(val as any).trim() */ : ""}`
			: `${indent}${key}: ${val as string}`)
	let bottom = bottom_content.length > 0 ? `\n${bottom_content.join("\n")}` : ""
	let res = top + bottom
	return res
}
