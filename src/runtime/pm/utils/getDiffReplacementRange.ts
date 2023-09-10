import type { Node } from "@tiptap/pm/model"
/**
 * Given two different nodes, calculates the range that needs to be replaced with the latter node, to sync them.
 *
 * ```ts
 * const offset = ... // the shared offset between the two nodes, if needed
 * const diff = getDiffReplacementRange(existingNode, convertedNewNode)
 * if (diff) {
 * 	intTr.replace(offset + diff.start, offset + diff.end, convertedNewNode.slice(diff.start, diff.otherEnd))
 * }
 * ```
 */
export function getDiffReplacementRange(
	nodeA: Node,
	nodeB: Node,
	offset: number = 0
): {
	start: number
	end: number
	/** For slicing the latter node. */
	sliceStart: number
	/** For slicing the latter node. */
	sliceEnd: number
} | null {
	const diffStart = nodeA.content.findDiffStart(nodeB.content)
	const diffEnd = nodeA.content.findDiffEnd(nodeB.content)
	if (diffStart === null || diffEnd === null) return null
	const nodeStart = Math.min(diffStart, diffEnd.a)
	const start = nodeStart + offset
	const end = diffEnd.a + offset
	return { start, end, sliceStart: nodeStart, sliceEnd: diffEnd.b }
}
