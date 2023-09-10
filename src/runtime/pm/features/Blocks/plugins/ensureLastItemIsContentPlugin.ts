import { unreachable } from "@alanscodelog/utils/unreachable"
import { getNodeType } from "@tiptap/core"
import type { NodeType } from "@tiptap/pm/model"
import { Plugin, PluginKey } from "@tiptap/pm/state"

import { createStateOnlyPluginApply } from "../../../utils/createStateOnlyPluginApply.js"

export const ensureLastBlockIsParagraphPluginKey = new PluginKey("ensureLastBlockIsParagraphPluginKey")

/**
 * Ensures that the last block is a paragraph for better cursor movement.
 *
 * Can be disabled for testing by initializing the plugin with `initialState: false`.
 */
export function ensureLastItemIsContentPlugin(
	contentTypeOrName: string | NodeType,
	itemTypeOrName: string | NodeType,
	{ initialState = true }: { initialState?: boolean } = {}
): Plugin {
	return new Plugin({
		key: ensureLastBlockIsParagraphPluginKey,
		state: {
			init() {
				return initialState
			},
			apply: createStateOnlyPluginApply(ensureLastBlockIsParagraphPluginKey)
		},
		appendTransaction: (_trs, _oldState, newState) => {
			const ignore = !ensureLastBlockIsParagraphPluginKey.getState(newState)
			if (ignore) return undefined
			const itemType = getNodeType(itemTypeOrName, newState.schema)
			const contentType = getNodeType(contentTypeOrName, newState.schema)
			const pos = newState.doc.content.size - 2
			const $last = newState.doc.resolve(pos)
			if ($last.node().type !== itemType) {
				unreachable()
			}
			const $content = newState.doc.resolve(newState.doc.content.size - 3)
			const tr = newState.tr
			// note that sometimes $last.node() === $content.node()
			// in the case of contentless blocks
			// it should be fine though because their types shouldn't be the same
			if ($content.node().type !== contentType) {
				tr.insert($last.end() + 1, itemType.create({}, [
					contentType.create()
				]))
				return tr
			}
			return undefined
		}
	})
}
