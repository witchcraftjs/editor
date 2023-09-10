import type { Node } from "@tiptap/pm/model"

export function recurse(
	node: Node,
	deep: boolean = true,
	props: ("size" | "is" | "attrs")[] = [],
	depth: number = 0
): string {
	const obj: any = {}
	const text = []

	text.push(`=${node?.type?.name ?? "any"} ${node.firstChild?.textContent ?? ""}`)
	if (node.textContent !== "" && node.isText) { text.push(`"${node.textContent}"`) }
	if (props.includes("size")) { text.push(node.nodeSize) }
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
	const content = (node.content as any).content as Node[]
	if (content && content.length > 0) {
		if (deep) {
			obj.children = `\n${Object.values(content).map((nodeInner: Node) => recurse(nodeInner, deep, props, depth + 1)).join("\n")}`
		} else {
			obj.children = `[${content.length}]`
		}
	}
	const indent = "\t".repeat(depth)
	const top = text.length > 0 ? indent + text.join(`\n${indent}`) : ""
	const bottomContent = Object.entries(obj).map(([key, val]) => key === "children"
		? `${indent}${val as string}`
		: key === "attrs"
			? `${val ? indent + (Object.keys(val as any).length > 0 ? JSON.stringify(val) : "")/* attrsToClasses(val as any).trim() */ : ""}`
			: `${indent}${key}: ${val as string}`)
	const bottom = bottomContent.length > 0 ? `\n${bottomContent.join("\n")}` : ""
	const res = top + bottom
	return res
}
