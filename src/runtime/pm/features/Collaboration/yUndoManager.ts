/*
 * Adapted from @tiptap/y-tiptap's yUndoPlugin state.init (https://github.com/tiptap/y-tiptap).
 * Divergence: y-tiptap creates the UndoManager inside a per-view PM plugin; we create it once per document (one manager shared by all editors of the doc) and History owns the undo/redo commands.
 */
import { defaultDeleteFilter } from "@tiptap/y-tiptap"
import * as Y from "yjs"

import { ySyncOrigin } from "./ySyncPlugin.js"

// mirrors upstream's default: paragraph deletions are not restored by undo (paragraph merge safety)
const defaultProtectedNodes = new Set(["paragraph"])

/**
 * Creates the shared Y.UndoManager for a document fragment, mirroring y-tiptap's option shape.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function createYUndoManager(
	fragment: Y.XmlFragment,
	{ protectedNodes = defaultProtectedNodes }: { protectedNodes?: Set<string> } = {}
): { undoManager: Y.UndoManager, destroy: () => void } {
	// mirrors upstream's yUndoPlugin state.init: capture the doc 'destroy' listeners
	// Y.UndoManager registers in its constructor that UndoManager.destroy() never removes,
	// so we can clean them up when the manager is destroyed.
	const doc = fragment.doc
	const destroyListenersBefore = new Set(doc ? (doc as any)._observers.get("destroy") : [])
	const undoManager = new Y.UndoManager(fragment, {
		trackedOrigins: new Set([ySyncOrigin]),
		captureTransaction: (tr: Y.Transaction) => tr.meta.get("addToHistory") !== false,
		deleteFilter: (item: any) => defaultDeleteFilter(item as never, protectedNodes)
	})
	const destroyListenersAfter = doc ? ((doc as any)._observers.get("destroy") as Set<(event: string, ...args: unknown[]) => void>) : new Set()
	const leakedDestroyListeners = Array.from(destroyListenersAfter).filter(listener => !destroyListenersBefore.has(listener))

	return {
		undoManager,
		destroy: () => {
			undoManager.destroy()
			if (doc) {
				for (const listener of leakedDestroyListeners) {
					doc.off("destroy", listener as any)
				}
			}
		}
	}
}
