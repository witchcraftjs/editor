/*
 * Adapted from @tiptap/y-tiptap's ySyncPlugin + ProsemirrorBinding (https://github.com/tiptap/y-tiptap).
 * Divergence: y-tiptap's sync plugin is per-view (one binding per editor view, created inside the plugin); ours is per-doc — one fragment/binding/observer shared by all editors of a document. The observer lives in bindBridge() alongside the push plugin; selection capture/restore lives in createCollaborationPlugins.ts and lib/selection.ts.
 */
import { Slice } from "@tiptap/pm/model"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { initProseMirrorDoc, yXmlFragmentToProsemirrorJSON } from "@tiptap/y-tiptap"
import type * as Y from "yjs"

import type { Bridge, CollabDocumentApi } from "./types.js"

/** Our own plugin key for the per-doc sync plugin. Kept separate from @tiptap/y-tiptap's ySyncPluginKey so our plugins are never confused with upstream ones. */
export const ySyncPluginKey = new PluginKey<{ bridge: Bridge }>("witchcraft-editor-y-sync")

// key identity doesn't work inside tests across the node/browser boundary causing
// issues so using a string for now
export const ySyncOrigin = (ySyncPluginKey as any).key

/**
 * The per-doc push plugin: when any editor of this document dispatches a local transaction, the new doc is pushed into the shared yjs fragment.
 * Key and origin semantics mirror y-tiptap's ySyncPlugin (same meta guard, same "skip if change-origin" check).
 *
 * @param {Bridge} bridge the shared per-doc bridge
 * @returns {Plugin}
 */
export const ySyncPlugin = (bridge: Bridge): Plugin => {
	let lastPushedDoc: unknown = undefined

	return new Plugin({
		key: ySyncPluginKey,
		state: {
			init: () => ({ bridge }),
			apply: (tr, val) => {
				if (tr.getMeta(ySyncPluginKey)) return val
				const willPush = tr.docChanged && lastPushedDoc !== tr.doc
				if (willPush) {
					lastPushedDoc = tr.doc
					bridge.pushFromPM(tr.doc)
				}
				return val
			}
		}
	})
}

/**
 * Wire the shared fragment/binding to a document: register the fragment observer that keeps the cached state in sync with remote changes.
 * Called once per document by createCollaborationPlugins.
 *
 * @param {Bridge} bridge the shared per-doc bridge
 */
export function bindBridge(bridge: Bridge, opts: {
	documentApi: CollabDocumentApi
	docId: string
	schema: unknown
	enableContentCheck?: boolean
	getConnectedEditors?: () => any[]
	onContentError?: (error: Error, context: { fragment: Y.XmlFragment, yDoc: Y.Doc, docId: string }) => undefined | "block"
}): void {
	const { documentApi, docId, schema, getConnectedEditors, enableContentCheck, onContentError } = opts

	// y fragment -> cached state.
	// undo/redo transact with the undo manager itself as origin, so they pass the guard below.
	bridge.fragment.observeDeep((_events, transaction) => {
		// our own pushes are skipped via the synchronous isPushing flag (set around pushFromPM's transact),
		// not via origin identity — duplicate module instances make ySyncPluginKey reference checks unreliable at runtime.
		if (bridge.isPushing) return
		const state = documentApi.getFromCache({ docId }) as { tr: any, doc: any } | undefined
		if (!state) return
		const { doc, mapping: renderMapping } = initProseMirrorDoc(bridge.fragment, schema as never)
		// keep the binding's mapping current so pushFromPM and cursor anchoring share one identity map
		bridge.binding.mapping.clear()
		for (const [k, v] of renderMapping) bridge.binding.mapping.set(k, v)
		const tr = state.tr.replace(0, state.doc.content.size, new Slice(doc.content, 0, 0))
		tr.setMeta(ySyncPluginKey, { isChangeOrigin: true })
		// undo/redo transact with the UndoManager itself as origin (yjs UndoManager.popStackItem)
		if (transaction.origin === bridge.undoManager) {
			tr.setMeta("y-undo", true)
		}
		documentApi.updateDocument({ docId }, tr)
	})

	if (enableContentCheck) {
		bridge.yDoc.on("beforeTransaction", () => {
			try {
				const json = yXmlFragmentToProsemirrorJSON(bridge.fragment)
				if (!json.content?.length) return
				;(schema as any).nodeFromJSON(json).check()
			} catch (error) {
				const ctx = { fragment: bridge.fragment, yDoc: bridge.yDoc, docId }

				for (const editor of getConnectedEditors?.() ?? []) {
					editor.emit("contentError", { error: error as Error, editor })
				}

				const verdict = onContentError?.(error as Error, ctx)
				if (verdict === "block") return false
			}
		})
	}
}
