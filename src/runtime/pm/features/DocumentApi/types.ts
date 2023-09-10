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
	/** Like {@link DocumentApi.preEditorInit}, but after initializing and loading the document (and before the transaction listeners are added). */
	postEditorInit: (docId: string, editor: Editor) => void
	/**
	 * Sets options before initializing the editor. By default just does `options.content = state.doc.toJSON()`, but can be useful when managing the document state in some other way (e.g. collab.
	 *
	 * Also useful for creating per-doc instances for certain extensions, such as Collaboration.
	 *
	 * This is a bit tricky to do normally since the editor component initializes the editor before the document is loaded and is re-used (the wrapper Editor *component*, not the editor) when the document changes.
	 *
	 * So this hook can be used to add these additional per-doc instances of extensions. Be sure to clone the properties you are modifying. They are only shallow cloned before being passed to the function.
	 *
	 * ```ts
	 * preEditorInit(docId, options: Partial<EditorOptions>, state: EditorState) {
	 * 	// we do not need to set options.content when using collab
	 * 	// so no options.content = state.doc.toJSON()
	 * 	const ydoc = cache.value[docId].ydoc
	 * 	// it's suggested you add the collab extension only here
	 *		// otherwise you would have to initially configure it with a dummy document
	 * 	const collabExt = Collaboration.configure({
	 * 		document: ydoc
	 * 	}) as any
	 * 	options.extensions = [
	 * 		...(options.extensions ?? []),
	 * 		collabExt
	 * 	]
	 * 	return options
	 * },
	 * load: async (
	 * 	docId: string,
	 * 	schema: Schema,
	 * 	plugins: Plugin[],
	 * ) => {
	 * 	if (cache.value[docId]?.state) {
	 * 		return { state: toRaw(cache.value[docId].state) }
	 * 	}
	 * 	const doc = getFromYourDb(docId)
	 * 	const decoded = toUint8Array(doc.contentBinary)
	 * 	const yDoc = new Y.Doc()
	 * 	Y.applyUpdate(yDoc, decoded)
	 *
	 * 	const yjs = initProseMirrorDoc(yDoc.getXmlFragment("prosemirror"), schema)
	 * 	const state = EditorState.create({
	 * 		doc: yjs.doc,
	 * 		schema,
	 * 		plugins:[
	 * 			...plugins,
	 * 			// the document api's yjs instance
	 * 			ySyncPlugin(yDoc.getXmlFragment("prosemirror"), {mapping:yjs.mapping}),
	 * 		]
	 * 	})
	 * 	// return the state and any additional data we want refCounter.load to be called with.
	 * 	return { state, doc, yDoc }
	 * },
	 * updateFilter(tr:Transaction) {
	 * 	const meta = tr.getMeta(ySyncPluginKey)
	 * 	if (meta) return false
	 * 	return true
	 * },
	 * ```
	 * See {@link DocumentApi.updateFilter} for why yjs (and other syncronization mechanisms) might need to ignore transactions.
	 */
	preEditorInit: (docId: string, options: Partial<EditorOptions>, state: EditorState) => Partial<EditorOptions>
	/**
	 * Return false to ignore the transaction.
	 *
	 * This is useful when using a secondary syncronization mechanism, such as yjs.
	 *
	 * If you load all editors of a file with yjs's plugin and point to the same ydoc, yjs's plugin will sync them. But that means that when the DocumentApi tries to sync the transactions they will have already been applied and the document update will fail.
	 *
	 * So we have to ignore all of yjs's transactions, but NOT transactions from partially embedded docs => full state, as these do not pass through yjs.
	 */
	updateFilter?: (tr: Transaction) => boolean | undefined
	updateDocument: (
		embedId: DocId,
		tr: Transaction,
		selfSymbol?: symbol
	) => void
	addEventListener (type: "saving" | "saved", cb: OnSaveDocumentCallback): void
	addEventListener (type: "update", cb: OnUpdateDocumentCallback): void
	removeEventListener (type: "saving" | "saved", cb: OnSaveDocumentCallback): void
	removeEventListener (type: "update", cb: OnUpdateDocumentCallback): void

	/** For the embedded document picker, should return suggestions for the search string. */
	getSuggestions: (searchString: string) => Promise<{ title: string, docId: string }[]>
	/** How to format the title of the embedded document. Defaults to docId#blockId */
	getEmbedTitle: (embedId: EmbedId) => string
	/**
	 * Tells the document api how to load an unloaded document and any additional data. Whatever this function returns will be passed to the refCounter.load option in the default DocumentApi implementation.
	 *
	 * ```ts
	 *	 load: async ( docId: string, schema: Schema, plugins: Plugin[],) => {
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
