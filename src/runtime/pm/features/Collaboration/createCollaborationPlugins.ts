/*
 * Per-document collaboration wiring. This file only assembles the pieces — no sync logic lives here.
 * The actual code mirrors @tiptap/y-tiptap's units 1:1 for easy diffing/upstream sync:
 *   ySyncPlugin.ts    — push plugin + fragment observer (their ySyncPlugin / ProsemirrorBinding)
 *   yUndoManager.ts   — shared undo manager creation (their yUndoPlugin state.init)
 *   lib/selection.ts  — relative selection restore (their restoreRelativeSelection; capture uses their exported getRelativeSelection directly)
 *   yCursorPlugin.ts  — remote cursor rendering (their yCursorPlugin)
 */
import type { Plugin } from "@tiptap/pm/state"
import { initProseMirrorDoc, ProsemirrorBinding, updateYFragment } from "@tiptap/y-tiptap"
import type * as Y from "yjs"

import type { Bridge, CollabDocumentApi } from "./types.js"
import { bindBridge, ySyncOrigin, ySyncPlugin } from "./ySyncPlugin.js"
import { createYUndoManager } from "./yUndoManager.js"
import { yUndoPlugin } from "./yUndoPlugin.js"

/**
 * Creates the per-document collaboration plugins, copied from tiptap's collaboration extension with a few minor changes to make it work with our document api.
 *
 * Builds the bridge (fragment, binding, undo manager, observer) and returns the per-doc plugin set.
 *
 * See {@link useTestDocumentApi} for an example of how to use it.
 * Note
 */
export function createCollaborationPlugins(opts: {
	yDoc: Y.Doc
	documentApi: CollabDocumentApi
	docId: string
	schema: unknown
	field?: string
	enableContentCheck?: boolean
	getConnectedEditors?: () => any[]
	onContentError?: (error: Error, context: { fragment: Y.XmlFragment, yDoc: Y.Doc, docId: string }) => undefined | "block"
	protectedNodes?: Set<string>
}): Plugin[] {
	const { yDoc, documentApi, docId, schema, field = "prosemirror", enableContentCheck, getConnectedEditors, onContentError, protectedNodes } = opts
	const fragment = yDoc.getXmlFragment(field)

	// one mapping owned by the binding, kept current in both directions:
	// updated from the fragment on every render (observer) and into the fragment on every push.
	const binding = new ProsemirrorBinding(fragment, undefined)
	// seed the mapping so selection capture works before any local push or remote update has populated it
	{
		const { mapping: initialMapping } = initProseMirrorDoc(fragment, schema as never)
		for (const [k, v] of initialMapping) binding.mapping.set(k, v)
	}

	const { undoManager } = createYUndoManager(fragment, { protectedNodes })
	// yjs internal: the UndoManager constructor normally sets this when given a Y.Doc; we set it manually because we create the manager ourselves
	;(yDoc as any)._undoManager = undoManager

	const bridge: Bridge = {
		yDoc,
		fragment,
		undoManager,
		binding,
		pushFromPM(pmDoc) {
			bridge.isPushing = true
			try {
				yDoc.transact(
					() => updateYFragment(yDoc, fragment, pmDoc as never, binding),
					ySyncOrigin
				)
			} finally {
				bridge.isPushing = false
			}
		}
	}

	bindBridge(bridge, { documentApi, docId, schema, enableContentCheck, getConnectedEditors, onContentError })

	return [ySyncPlugin(bridge), yUndoPlugin(undoManager, binding)]
}

