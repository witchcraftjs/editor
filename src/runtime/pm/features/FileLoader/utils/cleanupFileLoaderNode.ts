import type { NodeType, ResolvedPos } from "@tiptap/pm/model"
import type { Transaction } from "@tiptap/pm/state"

import { findUpwards } from "../../../utils/findUpwards.js"

/** Like {@link cleanupFileLoaderNodes} but for single nodes when you already know the position. Returns true if it deleted a node. */

export function cleanupFileLoaderNode(
	tr: Transaction,
	pos: number,
	fileLoaderType: NodeType,
	wrappingTypes: NodeType[],
	replaceType: NodeType
): boolean {
	const node = tr.doc.nodeAt(pos)
	if (!node) return false
	if (node.type === fileLoaderType) {
		let $parent: ResolvedPos | undefined
		findUpwards(tr.doc, pos, $pos => {
			if (wrappingTypes.includes($pos.parent.type)) {
				if ($pos.parent.childCount === 1) {
					$parent = $pos
				} else {
					return true
				}
			} else if ($parent) {
				return true
			}
			return false
		})
		if ($parent) {
			tr.delete($parent.start() - 1, $parent.end() + 1)
		} else {
			tr.replaceWith(pos, pos + node.nodeSize, replaceType.create())
		}
		return true
	}
	return false
}
