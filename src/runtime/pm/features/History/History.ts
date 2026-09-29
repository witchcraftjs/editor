import type { Command, Dispatch } from "@tiptap/core"
import TipTapHistoryExtension, { type HistoryOptions } from "@tiptap/extension-history"
import { history, redo, undo } from "@tiptap/pm/history"
import { type EditorState, Plugin, PluginKey, type Transaction } from "@tiptap/pm/state"

import { yRedo, yUndo, yUndoPluginKey } from "../Collaboration/yUndoPlugin.js"

function getFullState(storage: { documentApi?: any, docId?: string }) {
	const { documentApi, docId } = storage
	if (!documentApi || !docId) return undefined
	return documentApi.getFullState({ docId }) ?? undefined
}

export interface HistoryStorage {
	/**
	 * The document api, so undo/redo can find the per-doc state when a yjs UndoManager exists (collab documents). Set via `setCollabContext`.
	 */
	documentApi?: any
	/**
	 * The id of the document this editor is bound to. Used with `documentApi` to resolve the per-doc state. Set via `setCollabContext`.
	 */
	docId?: string
	/**
	 * If set, undo and redo will be forwarded to the editor this function returns instead of the current one, when a per-doc yjs UndoManager is not available (non-collab documents). This makes handling embedded editors easier.
	 *
	 * This is a function so as to make it easier to always get the latest state.
	 */
	redirectState?: () => EditorState | undefined
	/**
	 * Required if redirectState is set. Tells the extension how to forward the transactions.
	 */
	redirectDispatch?: Dispatch
}


declare module "@tiptap/core" {

	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		historyExtended: {
			/**
			 * Set the functions needed to forward history commands.
			 *
			 * Cleared automatically when the editor is destroyed.
			 */
			setHistoryRedirect: (
				redirectState?: HistoryStorage["redirectState"],
				redirectDispatch?: HistoryStorage["redirectDispatch"]
			) => ReturnType
			/**
			 * Set the document api and id so undo/redo can be routed to the per-doc yjs UndoManager when one exists.
			 */
			setCollabContext: (
				documentApi?: HistoryStorage["documentApi"],
				docId?: HistoryStorage["docId"]
			) => ReturnType
		}
	}

	interface Storage {
		history: HistoryStorage
	}
}

export const filterKey = "filterForHistoryForwarding"

/**
 * Extends the existing history extension to:
 * - forward undo/redo to a per-doc yjs UndoManager when one exists (collab documents)
 * - forward undo/redo to another editor's state for embedded editors on non-collab documents
 */

// eslint-disable-next-line @typescript-eslint/naming-convention
export const History = TipTapHistoryExtension.extend<HistoryOptions, HistoryStorage>({
	name: "history",
	addOptions() {
		return {
			depth: 100,
			newGroupDelay: 500
		}
	},

	addStorage(): HistoryStorage {
		return {}
	},

	onDestroy() {
		this.storage.redirectState = undefined
		this.storage.redirectDispatch = undefined
	},

	addCommands() {
		return {
			undo: (): Command => ({ state, dispatch, tr }) => {
				const fullState = getFullState(this.storage)
				if (fullState) {
					const undoManager = yUndoPluginKey.getState(fullState)?.undoManager ?? undefined
					if (undoManager) {
						tr.setMeta("preventDispatch", true)
						if (!dispatch) return undoManager.undoStack.length > 0
						if (undoManager.undoStack.length === 0) return false
						yUndo(fullState)
						return true
					}
				}

				const redirectState = this.storage.redirectState?.()
				const redirectDispatch = dispatch && this.storage.redirectDispatch
				if (redirectState) {
					// commands create transactions whether we return true or not
					// and because we apply our own transaction before the command ends
					// it thinks there is a state mismatch when it tries to apply the
					// command transaction
					// so we use the plugin to filter it out
					if (dispatch) {
						tr.setMeta(filterKey, true)
					}
					return undo(redirectState, redirectDispatch)
				} else {
					return undo(state, dispatch)
				}
			},
			redo: (): Command => ({ state, dispatch, tr }) => {
				const fullState = getFullState(this.storage)
				if (fullState) {
					const undoManager = yUndoPluginKey.getState(fullState)?.undoManager ?? undefined
					if (undoManager) {
						tr.setMeta("preventDispatch", true)
						if (!dispatch) return undoManager.redoStack.length > 0
						if (undoManager.redoStack.length === 0) return false
						yRedo(fullState)
						return true
					}
				}

				const redirectState = this.storage.redirectState?.()
				const redirectDispatch = this.storage.redirectDispatch
				if (redirectState) {
					tr.setMeta(filterKey, true)
					redo(redirectState, redirectDispatch)
					return true
				} else {
					return redo(state, dispatch)
				}
			},
			setHistoryRedirect: (redirectState?: () => EditorState | undefined, redirectDispatch?: Dispatch): Command => ({ dispatch }) => {
				if (dispatch) {
					this.storage.redirectState = redirectState
					this.storage.redirectDispatch = redirectDispatch
				}
				return true
			},
			setCollabContext: (documentApi?: any, docId?: string): Command => ({ dispatch }) => {
				if (dispatch) {
					this.storage.documentApi = documentApi
					this.storage.docId = docId
				}
				return true
			}
		}
	},
	addProseMirrorPlugins() {
		return [
			history(this.options),
			new Plugin({
				key: new PluginKey("history-forwarding"),
				filterTransaction: (transaction: Transaction) => {
					if (transaction.getMeta(filterKey)) {
						return false
					}
					return true
				}
			})
		]
	}
})
