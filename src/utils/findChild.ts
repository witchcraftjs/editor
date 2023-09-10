import type { Node, ResolvedPos } from "prosemirror-model"

import type { Filter } from "@/components/Editor/types"


export function findChild(main: Node, $parent: ResolvedPos, filter: Filter): ResolvedPos | undefined {
	const parent = $parent.node()
	const children: Node[] = (parent.content as any).content
	let pos = 0
	for (let i = 0; i < parent.childCount; i++) {
		pos += children[i].nodeSize
		const $child = main.resolve($parent.start() + pos - 1)
		if (filter($child, i)) return $child
	}
	return undefined
}
