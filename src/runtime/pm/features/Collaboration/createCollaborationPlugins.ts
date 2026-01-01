import type { CollaborationOptions } from "@tiptap/extension-collaboration"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import type { EditorView } from "@tiptap/pm/view"
import {
	ySyncPlugin,
	yUndoPlugin,
	yUndoPluginKey,
	yXmlFragmentToProsemirrorJSON
} from "@tiptap/y-tiptap"
import type { Doc } from "yjs"

/**
 * Copied from tiptap's collaboration extension with a few minor changes to make it work with our document api.
 *
 * Changes:
 *
 * - A local object is created for the plugin instance to simulate the extension's storage.
 * - When it needs the editor (for the `contentError` event), every editor currently using the doc is iterated over and sent the event.
 * - The normally editor level `enableContentCheck` option should be set here, it has no effect if passed to the extension.
 *
 * See {@link Collaboration} for more info and {@link useTestDocumentApi} for an example of how to use it.
 */
export function createCollaborationPlugins(
	options: CollaborationOptions & { enableContentCheck: boolean },
	schema: any,
	getConnectedEditors?: () => any
): Plugin[] {
	const storage = {
		isDisabled: false
	}
	const fragment = options.fragment
		? options.fragment
		: (options.document as Doc).getXmlFragment(options.field)

	// Quick fix until there is an official implementation (thanks to @hamflx).
	// See https://github.com/yjs/y-prosemirror/issues/114 and https://github.com/yjs/y-prosemirror/issues/102
	const yUndoPluginInstance = yUndoPlugin(options.yUndoOptions)
	const originalUndoPluginView = yUndoPluginInstance.spec.view

	yUndoPluginInstance.spec.view = (view: EditorView) => {
		const { undoManager } = yUndoPluginKey.getState(view.state)

		if (undoManager.restore) {
			undoManager.restore()
			undoManager.restore = () => {
				// noop
			}
		}

		const viewRet = originalUndoPluginView ? originalUndoPluginView(view) : undefined

		return {
			destroy: () => {
				const hasUndoManSelf = undoManager.trackedOrigins.has(undoManager)

				const observers = undoManager._observers

				undoManager.restore = () => {
					if (hasUndoManSelf) {
						undoManager.trackedOrigins.add(undoManager)
					}

					undoManager.doc.on("afterTransaction", undoManager.afterTransactionHandler)

					undoManager._observers = observers
				}

				if (viewRet?.destroy) {
					viewRet.destroy()
				}
			}
		}
	}

	const ySyncPluginOptions: Parameters<typeof ySyncPlugin>[1] = {
		...options.ySyncOptions,
		onFirstRender: options.onFirstRender
	}

	const ySyncPluginInstance = ySyncPlugin(fragment, ySyncPluginOptions)

	if (options.enableContentCheck) {
		fragment.doc?.on("beforeTransaction", () => {
			try {
				const jsonContent = yXmlFragmentToProsemirrorJSON(fragment)

				if (jsonContent.content.length === 0) {
					return
				}

				schema.nodeFromJSON(jsonContent).check()
			} catch (error) {
				for (const editor of (getConnectedEditors?.() ?? [])) {
					editor.emit("contentError", {
						error: error as Error,
						editor: editor,
						disableCollaboration: () => {
							fragment.doc?.destroy()
							storage.isDisabled = true
						}
					})
				}
				// If the content is invalid, return false to prevent the transaction from being applied
				return false
			}
		})
	}

	return [
		ySyncPluginInstance,
		yUndoPluginInstance,
		options.enableContentCheck
		&& new Plugin({
			key: new PluginKey("filterInvalidContent"),
			filterTransaction: () => {
				// When collaboration is disabled, prevent any sync transactions from being applied
				if (storage.isDisabled !== false) {
					// Destroy the Yjs document to prevent any further sync transactions
					fragment.doc?.destroy()

					return true
				}
				// TODO should we be returning false when the transaction is a collaboration transaction?

				return true
			}
		})
	].filter(Boolean)
}
