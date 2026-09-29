/*
 * Adapted from @tiptap/y-tiptap's yUndoPlugin (https://github.com/tiptap/y-tiptap).
 * Divergence: y-tiptap creates the UndoManager per view inside state.init and destroys it with the view; we create it once per document (one manager shared by all editors of the doc) in createCollaborationPlugins and pass it in, so init just stores it.
 */
import { type EditorState, Plugin, PluginKey } from "@tiptap/pm/state"
import { getRelativeSelection, type ProsemirrorBinding } from "@tiptap/y-tiptap"
import type * as Y from "yjs"

import type { RelativeSelection } from "./types.js"

/** Our own plugin key for the per-doc undo plugin. Kept separate from @tiptap/y-tiptap's yUndoPluginKey so our plugins are never confused with upstream ones. */
export const yUndoPluginKey = new PluginKey<{
	undoManager: Y.UndoManager
	prevSel: RelativeSelection | null
	hasUndoOps: boolean
	hasRedoOps: boolean
}>("witchcraft-editor-y-undo")

/**
 * Undoes the last local change on this document's shared undo manager.
 * Mirrors @tiptap/y-tiptap's standalone undo command (reads the manager from plugin state).
 * Pass the per-doc EditorState (from documentApi.getFullState) — our collab plugins live there, not on each view's state.
 */
export const yUndo = (state: EditorState): boolean => {
	const undoManager = yUndoPluginKey.getState(state)?.undoManager
	if (undoManager != null) {
		undoManager.undo()
		return true
	}
	return false
}

/**
 * Redoes the last undone change on this document's shared undo manager.
 * Mirrors @tiptap/y-tiptap's standalone redo command (reads the manager from plugin state).
 * Pass the per-doc EditorState (from documentApi.getFullState) — our collab plugins live there, not on each view's state.
 */
export const yRedo = (state: EditorState): boolean => {
	const undoManager = yUndoPluginKey.getState(state)?.undoManager
	if (undoManager != null) {
		undoManager.redo()
		return true
	}
	return false
}

/**
 * Holds the shared per-doc undo manager in plugin state, mirroring y-tiptap's yUndoPlugin.
 * The manager is created once per document by {@link createCollaborationPlugins} and passed in here.
 */
export const yUndoPlugin = (undoManager: Y.UndoManager, binding: ProsemirrorBinding): Plugin => new Plugin({
	key: yUndoPluginKey,
	state: {
		init: (): { undoManager: Y.UndoManager, prevSel: RelativeSelection | null, hasUndoOps: boolean, hasRedoOps: boolean } => ({
			undoManager,
			prevSel: null,
			hasUndoOps: undoManager.undoStack.length > 0,
			hasRedoOps: undoManager.redoStack.length > 0
		}),
		apply: (_tr, _val, _oldState, state) => {
			const hasUndoOps = undoManager.undoStack.length > 0
			const hasRedoOps = undoManager.redoStack.length > 0
			return {
				undoManager,
				prevSel: getRelativeSelection(binding, state) as RelativeSelection | null,
				hasUndoOps,
				hasRedoOps
			}
		}
	}
})
