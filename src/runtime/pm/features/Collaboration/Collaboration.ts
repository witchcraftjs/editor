import type { Command } from "@tiptap/core"
import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { getRelativeSelection } from "@tiptap/y-tiptap"
import type { Awareness } from "y-protocols/awareness"

import { restoreRelativeSelection } from "./lib/selection.js"
import type { Bridge, CursorOptions, RelativeSelection } from "./types.js"
import { yCursorPlugin } from "./yCursorPlugin.js"
import { ySyncPluginKey } from "./ySyncPlugin.js"

declare module "@tiptap/core" {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		collaboration: {
			/**
			 * Registers the per-doc bridge with this editor's collaboration extension.
			 */
			setCollabBridge: (bridge?: Bridge) => ReturnType
		}
	}
}

/**
 *
 * We can't use tiptap's collaboration extension (or any extension that creates the sync plugin) because it expects to be configured with the document's ydoc per editor.
 *
 * This doesn't mesh well with how the document api works (see {@link DocumentApi}).
 *
 * This extension **only** handles the per-view functionality which currently only includes handling collab cursors and keeping their positions stable. It **DOES NOT** handle the actual syncing or related options.
 *
 * That lives on the per-doc cached state, created once per document by {@link createCollaborationPlugins} (see {@link useTestDocumentApi} for an example).
 *
 * The extension only reads from the shared bridge to restore this view's selection after remote transactions.
 *
 * With an awareness provider configured, it also renders remote cursors via yCursorPlugin.
 *
 * The bridge is created at document load, before any view exists, so this extension is
 * registered unconfigured and handed its bridge later via the `setCollabBridge` command.
 *
 * Any options missing here (such as `enableContentCheck`) from the regular tiptap collaboration extension are usually
 * available in `createCollaborationPlugins`.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const Collaboration = Extension.create({
	name: "collaboration",
	priority: Number.MAX_SAFE_INTEGER,
	addOptions() {
		return {
			awareness: undefined as Awareness | undefined,
			cursorOptions: undefined as CursorOptions | undefined
		}
	},
	addStorage(): {
		bridge: Bridge | undefined
		pendingSelections: Map<any, RelativeSelection>
	} {
		return {
			bridge: undefined,
			pendingSelections: new Map()
		}
	},
	addCommands() {
		return {
			setCollabBridge: (bridge?: Bridge): Command => ({ dispatch }) => {
				if (!dispatch) return false
				this.storage.bridge = bridge
				return true
			}
		}
	},
	onDestroy() {
		this.storage.bridge = undefined
		this.storage.pendingSelections.clear()
	},
	addProseMirrorPlugins() {
		const editor = this.editor
		const { awareness, cursorOptions } = this.options
		const storage = this.storage

		const plugins: Plugin[] = []
		if (awareness && storage.bridge) {
			plugins.push(yCursorPlugin(storage.bridge, awareness, cursorOptions))
		}

		// the bridge may be registered via setCollabBridge after the view is created,
		// so capture listeners are attached lazily on first use.
		let onBeforeAllTransactions: (() => void) | undefined
		let onAfterAllTransactions: (() => void) | undefined
		function attachBridgeListeners(): void {
			const bridge = storage.bridge!
			// capture this editor's selection once per batch of fragment transactions,
			// while the mapping still matches this view's state.
			// mirrors upstream's y-tiptap's beforeAllTransactions/afterAllTransactions hooks on the binding.
			onBeforeAllTransactions = () => {
				const state = editor.state
				if (!state) return
				storage.pendingSelections.set(editor, getRelativeSelection(bridge.binding, state))
			}
			onAfterAllTransactions = () => {
				storage.pendingSelections.delete(editor)
			}
			bridge.yDoc.on("beforeAllTransactions", onBeforeAllTransactions)
			bridge.yDoc.on("afterAllTransactions", onAfterAllTransactions)
		}

		plugins.push(
			new Plugin({
				key: new PluginKey("collaboration-restore"),
				view() {
					if (storage.bridge) attachBridgeListeners()
					return {
						destroy() {
							const bridge = storage.bridge
							if (bridge && onBeforeAllTransactions && onAfterAllTransactions) {
								bridge.yDoc.off("beforeAllTransactions", onBeforeAllTransactions)
								bridge.yDoc.off("afterAllTransactions", onAfterAllTransactions)
								storage.pendingSelections.delete(editor)
							}
						}
					}
				},
				appendTransaction(transactions, _oldState, newState) {
					const bridge = storage.bridge
					if (!bridge) return null

					if (!onBeforeAllTransactions) attachBridgeListeners()

					const tr = transactions.find(tr => tr.getMeta(ySyncPluginKey))
					if (!tr) return null

					const relSel = storage.pendingSelections.get(editor) ?? null
					if (!relSel?.anchor || !relSel.head) return null

					const newTr = newState.tr
					restoreRelativeSelection(newTr, relSel, bridge.binding)
					return newTr
				}
			})
		)
		return plugins
	}
})
