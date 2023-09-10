import type { Command, Dispatch, Extension } from "@tiptap/core"
import TipTapHistoryExtension from "@tiptap/extension-history"
import { history, redo, undo } from "@tiptap/pm/history"
import { type EditorState, Plugin, PluginKey, type Transaction } from "@tiptap/pm/state"

declare module "@tiptap/core" {

	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		historyExtended: {

			/**
			 * Set the functions needed to forward history commands.
			 *
			 * Set to null to disable. Should be set to null before destroying the editor.
			 */
			setHistoryRedirect: (
				redirectState?: () => EditorState | undefined,
				redirectDispatch?: Dispatch
			) => ReturnType
		}
	}
}

declare module "@tiptap/extension-history" {
	interface HistoryOptions {
		/**
		 * If set, undo and redo will be forwarded to the editor this function returns instead of the current one. This makes handling embedded editors easier.
		 *
		 * This is a function so as to make it easier to always get the latest state.
		 */
		redirectState?: () => EditorState | undefined
		/**
		 * Required if redirectState is set. Tells the extension how to forward the transactions.
		 */
		redirectDispatch?: Dispatch
	}
}

export const filterKey = "filterForHistoryForwarding"
/**
	* Extends the existing history extension to allow for forwarding of history for embedded editors.
	*
	* The embedded editor node view will take care of
	*/

// eslint-disable-next-line @typescript-eslint/naming-convention
export const History = (TipTapHistoryExtension as any as Extension /* vue-tsc issue */).extend({
	name: "history",
	addOptions() {
		return {
			depth: 100,
			newGroupDelay: 500,
			redirectState: undefined,
			redirectDispatch: undefined
		}
	},

	addCommands() {
		return {
			undo: (): Command => ({ state, dispatch, tr }) => {
				const redirectState = this.options.redirectState?.()
				const redirectDispatch = dispatch && this.options.redirectDispatch
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
				const redirectState = this.options.redirectState?.()
				const redirectDispatch = this.options.redirectDispatch
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
					this.options.redirectState = redirectState
					this.options.redirectDispatch = redirectDispatch
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
