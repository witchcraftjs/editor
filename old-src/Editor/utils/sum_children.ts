import type { Node, ResolvedPos } from "prosemirror-model"

/**
 * Returns the size of a position's node's children. Useful for getting the size of sibling from 0 to some specific index to get the position of a child at a given index.
 * @param $parent The parent whose children will be searched
 * @param opts.start What child to start at.
 * @param opts.end What child to stop at.
 */
export function sum_children(
	$parent: ResolvedPos,
	{ start = 0, end = undefined }: { start?: number, end?: number } = {},
): number {
	let parent = $parent.node()
	let children: Node[] = (parent.content as any).content

	let stop: number = end === undefined ? children.length : end
	if (parent.childCount < stop) {
		throw new Error(`Limit ${stop} greater than child count ${parent.childCount}.`)
	}
	let count = 0
	for (let i = start; i < stop; i++) {
		count += children[i].nodeSize
	}
	return count
}
