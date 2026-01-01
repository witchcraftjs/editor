import type { Content, Editor, EditorOptions } from "@tiptap/core"
import type { EditorState, Transaction } from "@tiptap/pm/state"
import type { InjectionKey } from "vue"

export const documentApiInjectionKey = Symbol("documentApiInjectionKey") as InjectionKey<DocumentApiInterface>

export type DocId = {
	docId: string
}
export type BlockId = {
	blockId?: string
}
/** When the user initially creates an embed, it's docId will be undefined. */
export type MaybeEmbedId = Partial<DocId> & BlockId
export type EmbedId = DocId & BlockId

export type OnUpdateDocumentCallback = (
	embedId: DocId,
	tr: Transaction,
	oldEditorState: EditorState,
	newEditorState: EditorState,
	selfSymbol?: symbol
) => void
export type OnSaveDocumentCallback = (docId: string) => void

// todo separate internal documentation of api from the options that are also used int the default implementation to configure it.
export type DocumentApiInterface<
	T extends Record<string, any> = Record<string, any>
> = {
	/** Debounced save (to storage) function. Use the event listeners to get notified when saving finishes. */
	save: (docId: string) => void
	getEmbeddedContent: (embedId: EmbedId) => Content | undefined
	getFromCache: (docId: DocId, options?: { errorIfNotFound?: boolean }) => EditorState | undefined
	/** Load should be called the first time, before attempting to load the state. */
	getFullState: (docId: DocId) => EditorState
	/**
	 * For replacing {@link DocumentApi.preEditorInit} which runs after initializing and loading the document but before the transaction listeners are added.
	 *
	 * Can be used to add the Collaboration extension for example (see useTestDocumentApi for an example).
	 *
	 * The default implementation just sets the content:
	 *
	 * ```ts
	 * preEditorInit: (_docId, options, state) => {
	 *		options.content = state.doc.toJSON()
	 *		return options
	 *	}
	 * ```
	 *
	 */
	postEditorInit: (docId: string, editor: Editor) => void
	connectedEditors: Record<string, Editor[]>
	connectEditor: (docId: string, editor: Editor) => void
	disconnectEditor: (docId: string, editor: Editor) => void
	/**
	 * Sets options before initializing the editor. By default just does `options.content = state.doc.toJSON()`, but can be useful for using **per editor component** plugins.
	 *
	 * This is normally a bit tricky to do since the editor component initializes the editor before the document is loaded and is re-used (the wrapper Editor *component*, not the editor) when the document changes.
	 *
	 * So this hook can be used to add these additional per-editor instances of extensions. Be sure to clone the properties you are modifying. They are only shallow cloned before being passed to the function.
	 *
	 * If you need **per doc** plugins use `load` instead. See {@link useTestDocumentApi} for an example.
	 *
	 * ```ts
	 * preEditorInit(docId, options: Partial<EditorOptions>, state: EditorState) {
	 * 	// we do not need to set options.content when using collab
	 * 	// so no options.content = state.doc.toJSON()
	 * 	const ydoc = cache.value[docId].ydoc
	 * 	// it's suggested you add the collab extension only here
	 *		// otherwise you would have to initially configure it with a dummy document
	 * 	options.extensions = [
	 * 		...(options.extensions ?? []),
	 *			// per editor extensions
	 * 	]
	 * 	return options
	 * },
	 * ```
	 */
	preEditorInit: (docId: string, options: Partial<EditorOptions>, state: EditorState) => Partial<EditorOptions>
	/**
	 * Return false to prevent applying the transaction to the state in the cache.
	 *
	 * This used to be needed to ignore yjs transactions, but that's no longer the case. Even with multiple editors loaded to use the same ydoc, everything should work. Leaving the option in case it's needed for some other rare use case.
	 */
	updateFilter?: (tr: Transaction) => boolean | undefined
	updateDocument: (
		embedId: DocId,
		tr: Transaction,
		selfSymbol?: symbol
	) => void
	addEventListener(type: "saving" | "saved", cb: OnSaveDocumentCallback): void
	addEventListener(type: "update", cb: OnUpdateDocumentCallback): void
	removeEventListener(type: "saving" | "saved", cb: OnSaveDocumentCallback): void
	removeEventListener(type: "update", cb: OnUpdateDocumentCallback): void

	/** For the embedded document picker, should return suggestions for the search string. */
	getSuggestions: (searchString: string) => Promise<{ title: string, docId: string }[]>
	/** How to format the title of the embedded document. Defaults to docId#blockId */
	getEmbedTitle: (embedId: EmbedId) => string
	/**
	 * Tells the document api how to load an unloaded document and any additional data. Whatever this function returns will be passed to the refCounter.load option in the default DocumentApi implementation.
	 *
	 * ```ts
	 *	 load: async ( docId: string, schema: Schema, plugins: Plugin[], getConnectedEditors: () => Editor[]) => {
	 * 	const dbDoc = getFromYourDb(docId)
	 *
	 * 	const state = EditorState.create({
	 * 		doc: yjs.doc,
	 * 		schema,
	 * 		plugins
	 * 	})
	 * 	// return the state and any additional data we want to cache
	 * 	return { state, data: { dbDoc } }
	 * },
	 * ```
	 * See {@link DocumentApi.preEditorInit} for how to set this up with sync (e.g. yjs).
	 */
	load: (docId: DocId) => Promise<{ state: EditorState, data?: T }>
	/** Notifies the document api that an editor has unloaded the document. */
	unload: (docId: DocId) => void
}
