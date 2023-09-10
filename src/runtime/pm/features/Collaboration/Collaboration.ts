import { type Editor, Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import type { EditorView } from "@tiptap/pm/view"
import {
	redo,
	undo,
	type UndoPluginState,
	ySyncPlugin,
	yUndoPlugin,
	yUndoPluginKey,
	yXmlFragmentToProseMirrorRootNode } from "y-prosemirror"
import * as Y from "yjs"

const ySyncFilterPluginKey = new PluginKey("ySyncFilter")
// eslint-disable-next-line @typescript-eslint/naming-convention
type YSyncOpts = Parameters<typeof ySyncPlugin>[1]
// eslint-disable-next-line @typescript-eslint/naming-convention
type YUndoOpts = Parameters<typeof yUndoPlugin>[0]

declare module "@tiptap/core" {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		collaboration: {
			/** Sets the fragment to use for the collaboration extension. */
			setFragment: (
				fragment: Y.XmlFragment | undefined,
				options?: { register?: boolean, unregister?: boolean }
			) => ReturnType
			/** Enables or disables collaboration. */
			enableCollaboration: (enable: boolean) => ReturnType
			/**
			 * Undo recent changes
			 *
			 * @example editor.commands.undo()
			 */
			undo: () => ReturnType
			/**
			 * Reapply reverted changes
			 *
			 * @example editor.commands.redo()
			 */
			redo: () => ReturnType
		}
	}
}

export interface CollaborationStorage {
	/**
	 * Whether collaboration is currently disabled.
	 * Disabling collaboration will prevent any changes from being synced with other users.
	 */
	isDisabled: boolean
}

export interface CollaborationOptions {

	/**
	 * A raw Y.js fragment, can be used instead of `document` and `field`.
	 *
	 * @example new Y.Doc().getXmlFragment('body')
	 */
	fragment?: Y.XmlFragment | null

	/**
	 * Fired when the content from Yjs is initially rendered to Tiptap.
	 */
	onFirstRender?: () => void

	/**
	 * Options for the Yjs sync plugin.
	 */
	ySyncOptions?: YSyncOpts

	/**
	 * Options for the Yjs undo plugin.
	 */
	yUndoOptions?: YUndoOpts
	/** @internal */
	// eslint-disable-next-line @typescript-eslint/naming-convention
	_destroySyncPlugin?: () => void
}
type CollabInstance = {
	editor: Editor
	options: CollaborationOptions
	storage: CollaborationStorage
}
type ExtendedUndoManager = UndoPluginState["undoManager"] & {
	restore?: () => void
}

function createUndoPlugin(self: CollabInstance): Plugin { // Quick fix until there is an official implementation (thanks to @hamflx).
	// See https://github.com/yjs/y-prosemirror/issues/114 and https://github.com/yjs/y-prosemirror/issues/102
	const yUndoPluginInstance = yUndoPlugin(self.options.yUndoOptions)
	const originalUndoPluginView = yUndoPluginInstance.spec.view

	yUndoPluginInstance.spec.view = (view: EditorView) => {
		const { undoManager } = yUndoPluginKey.getState(view.state) as UndoPluginState & { undoManager: ExtendedUndoManager }

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
	return yUndoPluginInstance
}
function createSyncPlugin(
	self: CollabInstance
): { plugin: Plugin, destroy: () => void } {
	const fragment = self.options.fragment
	if (!fragment) {
		throw new Error("Collaboration requires a fragment.")
	}
	const plugin = ySyncPlugin(fragment, {
		...self.options.ySyncOptions,
		onFirstRender: self.options.onFirstRender
	})

	let off: (() => void) | undefined
	function destroy(): void {
		off?.()
		// delete self.editor.state[ySyncPluginKey.key]
	}
	if (self.editor.options.enableContentCheck) {
		const onBeforeTransaction = (): false | undefined => {
			try {
				yXmlFragmentToProseMirrorRootNode(fragment, self.editor.schema).check()
			} catch (error) {
				self.editor.emit("contentError", {
					error: error as Error,
					editor: self.editor,
					disableCollaboration: () => {
						fragment.doc?.destroy()
						self.storage.isDisabled = true
					}
				})
				// If the content is invalid, return false to prevent the transaction from being applied
				return false
			}
			return undefined
		}
		fragment.doc?.on("beforeTransaction", onBeforeTransaction)
		off = () => {
			fragment.doc?.off("beforeTransaction", onBeforeTransaction)
		}
	}
	return { plugin, destroy }
}

function createSyncFilterPlugin(
	self: CollabInstance
): Plugin | undefined {
	if (!self.editor.options.enableContentCheck) return
	const fragment = self.options.fragment
	if (!fragment) {
		throw new Error("Collaboration requires a fragment.")
	}
	return new Plugin({
		key: ySyncFilterPluginKey,
		filterTransaction: () => {
			// When collaboration is disabled, prevent any sync transactions from being applied
			if (self.storage.isDisabled) {
				// Destroy the Yjs document to prevent any further sync transactions
				fragment.doc?.destroy()

				return true
			}

			return true
		}
	})
}

function createPlugins(self: CollabInstance): Plugin[] {
	const { plugin: syncPlugin, destroy: destroySyncPlugin } = createSyncPlugin(self)
	self.options._destroySyncPlugin = destroySyncPlugin
	const filterPlugin = createSyncFilterPlugin(self)
	const plugins = [
		syncPlugin,
		createUndoPlugin(self)
	]
	if (filterPlugin) {
		plugins.push(filterPlugin)
	}
	return plugins
}

/**
 * This extension allows you to collaborate with others in real-time.
 *
 * @see https://tiptap.dev/api/extensions/collaboration
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const Collaboration = Extension.create<CollaborationOptions, CollaborationStorage>({
	name: "collaboration",

	priority: 1000,

	addOptions() {
		return {
			document: null,
			field: "default",
			fragment: new Y.Doc().getXmlFragment("prosemirror")
		}
	},

	addStorage() {
		return {
			isDisabled: false
		}
	},

	onCreate() {
		if (this.editor.extensionManager.extensions.find(extension => extension.name === "history")) {
			// eslint-disable-next-line no-console
			console.warn(
				"[tiptap warn]: \"@tiptap/extension-collaboration\" comes with its own history support and is not compatible with \"@tiptap/extension-history\"."
			)
		}
	},

	addCommands() {
		// const self = this
		return {
			enableCollaboration: (enable: boolean) => () => {
				this.storage.isDisabled = !enable
				return true
			},
			undo: () => ({ tr, state, dispatch }) => {
				tr.setMeta("preventDispatch", true)

				const undoManager = yUndoPluginKey.getState(state)!.undoManager as ExtendedUndoManager

				if (undoManager.undoStack.length === 0) {
					return false
				}

				if (!dispatch) {
					return true
				}

				return undo(state)
			},
			redo: () => ({ tr, state, dispatch }) => {
				tr.setMeta("preventDispatch", true)

				const undoManager = yUndoPluginKey.getState(state)!.undoManager as ExtendedUndoManager

				if (undoManager.redoStack.length === 0) {
					return false
				}

				if (!dispatch) {
					return true
				}

				return redo(state)
			}

		}
	},
	onDestroy() {
		this.options._destroySyncPlugin?.()
	},

	addProseMirrorPlugins(): Plugin[] {
		const self = this
		return createPlugins(self)
	}
})
