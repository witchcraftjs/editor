import type { EditorState } from "@tiptap/pm/state"

import { placeholderPluginKey } from "../../src/runtime/pm/features/FileInsert/plugins/placeholderPlugin.js"

/**
 * Returns the positions of all placeholder decorations in the given state.
 *
 * Returns an empty array if no placeholder decorations exist.
 */
export function findAnyPlaceholder(state: EditorState): number[] {
	const decos = placeholderPluginKey.getState(state)
	if (!decos) return []

	return decos.find().map(deco => deco.from)
}
