import { debounce, type DebounceQueue } from "@alanscodelog/utils/debounce"
import { unreachable } from "@alanscodelog/utils/unreachable"
import type { Content, EditorOptions } from "@tiptap/core"
import type { Schema } from "@tiptap/pm/model"
import type { EditorState, Plugin, Transaction } from "@tiptap/pm/state"
import { Editor } from "@tiptap/vue-3"
import { isProxy } from "vue"

import type { DocId, DocumentApiInterface, EmbedId, OnSaveDocumentCallback, OnUpdateDocumentCallback } from "./types.js"
import { convertTransactionForFullState } from "./utils/convertTransactionForFullState.js"
import { getEmbedJson } from "./utils/getEmbedJson.js"
import { getEmbedNodeFromDoc } from "./utils/getEmbedNodeFromDoc.js"

// IMPORTANT: We must be super careful to unwrap the state proxy with toRaw before passing it to anything or it can create painful to debug errors.

/**
 * Configures the document api which tells the editor how to load/unload/save/cache documents, including embedded ones.
 *
 * The cache implementation is left up to the user, hence why it's defined as a get/set interface. A load function must be provided for requesting uncached documents.
 *
 * `save` is optional, but you probably want to save. The function is automatically debounced the configured amount.
 *
 * **Any function that needs to return a document should return it unwrapped with toRaw if it was a ref or in a ref or reactive. **
 *
 * A `refCounter` object can be provided with the respective load/unload functions to be notified when embedded views load/unload documents to reference count them and unload them once no editors have them in use.
 *
 * It is safe to call load multiple times for the same document, the actual load function will only be called once per document, but the refCounter will be called multiple times.
 *
 * The `getTitle` function can be provided to customize the title of the embedded document. It's passed the full embed id and returns it as docId#blockId by default.
 *
 * If there are extensions that use onCreate to set state or have plugins that need to change the state on init with appendTransaction, they will not work since there is no view to initialize the plugins. To get around this, plugins can specify a stateInit function that will be called with a transaction from the initial loaded state which it can then modify while having access to `this` and the extension options.
 *
 * The api creates a default instance of the editor to copy plugins from, this can be replaced by passing your own editor instance.
 *
 * See {@link useTestDocumentApi} for an example of how to set things up.
 */
export class DocumentApi<
	T extends Record<string, any> = Record<string, any>
> implements DocumentApiInterface<T> {
	private readonly _callbacks: {
		update: OnUpdateDocumentCallback[]
		saved: OnSaveDocumentCallback[]
		saving: OnSaveDocumentCallback[]
	} = { update: [], saved: [], saving: [] }

	private readonly _load: (docId: string, schema: Schema, plugins: Plugin[]) => Promise<{ state: EditorState, data?: T }>

	private readonly _save?: (docId: string) => Promise<void>

	private readonly _saveQueue: DebounceQueue = {}

	readonly save: DocumentApiInterface<T>["save"]

	private readonly _cache: {
		get: (docId: string) => EditorState | undefined
		set: (docId: string, state: EditorState) => void
	}

	/**
	 * The refCounter is called every time an editor loads or unloads a document. It's used to keep track of the number of editors that are using a document, and to unload it when no editors are using it.
	 *
	 * Note that you need not immediately unload the cached document. So long as the count is immediatly updated you can set a timeout to actually delete the cache entry (be sure to check the count it still 0 and you can delete it).
	 */
	private readonly _refCounter: {
		load: (docId: string, loaded: { state: EditorState, data?: T }) => void
		unload: (docId: string) => void
	}

	getSuggestions: DocumentApiInterface["getSuggestions"]

	getEmbedTitle: DocumentApiInterface["getEmbedTitle"]

	postEditorInit: DocumentApiInterface["postEditorInit"]

	// editor + updateState does not work :/
	preEditorInit: DocumentApiInterface["preEditorInit"] = (_docId, options, state) => {
		options.content = state.doc.toJSON()
		return options
	}

	updateFilter?: DocumentApiInterface["updateFilter"] = () => true

	editor: Editor

	constructor({
		editorOptions,
		getTitle,
		getSuggestions,
		load,
		save,
		saveDebounce = 1000,
		cache,
		refCounter,
		postEditorInit,
		preEditorInit,
		updateFilter
	}: {
		/**
		 * The editor options for the internal instance to use to keep track of the document state. It should include the same extensions as the root editor.
		 */
		editorOptions: Partial<EditorOptions>
		getTitle?: (docId: string, blockId?: string) => string
		getSuggestions: DocumentApiInterface["getSuggestions"]
		load: (docId: string, schema: Schema, plugins: Plugin[]) => Promise<{ state: EditorState, data?: T }>
		save?: DocumentApi["_save"]
		saveDebounce?: number
		cache: DocumentApi["_cache"]
		refCounter: DocumentApi<T>["_refCounter"]
		postEditorInit?: DocumentApi["postEditorInit"]
		preEditorInit?: DocumentApi["preEditorInit"]
		updateFilter?: DocumentApi["updateFilter"]
	}) {
		this.updateFilter = updateFilter
		this.getEmbedTitle = getTitle
			? ({ docId, blockId }: EmbedId) => getTitle(docId, blockId)
			: ({ docId, blockId }: EmbedId) => `${docId}${blockId ? `#${blockId}` : ""}`
		this._load = load
		this._cache = cache
		this._refCounter = refCounter
		this._save = save
		const debouncedSave = debounce(this._saveDocument.bind(this), saveDebounce, {
			queue: this._saveQueue,
			// even though save is async, promisified debounce is slightly more expensive because it creates a new function with every call
			// and we don't really need that
			promisify: false
		}) as any

		this.save = function save(docId: string): void {
			for (const cb of this._callbacks.saving) {
				cb(docId)
			}
			debouncedSave(docId)
		}

		this.postEditorInit = postEditorInit ?? (() => {})
		if (preEditorInit) this.preEditorInit = preEditorInit
		this.getSuggestions = getSuggestions
		this.editor = new Editor({
			...editorOptions,
			extensions: [...editorOptions.extensions!],
			injectCSS: false
		})
	}

	// eslint-disable-next-line @typescript-eslint/naming-convention
	async _saveDocument(docId: string): Promise<void> {
		if (this._save) {
			await this._save(docId)
			for (const cb of this._callbacks.saved) {
				cb(docId)
			}
		} else {
			// eslint-disable-next-line no-console
			console.warn("No save function provided, ignoring save request.")
		}
	}

	updateDocument(
		embedId: DocId,
		tr: Transaction,
		updaterSymbol?: symbol
	): void {
		if (this.updateFilter && this.updateFilter(tr) === false) return
		const stateBefore = this.getFromCache(embedId, { errorIfNotFound: true })
		const modifiedTr = convertTransactionForFullState(stateBefore, tr)
		const newState = stateBefore.apply(modifiedTr)
		this._cache.set(embedId.docId, newState)
		for (const cb of this._callbacks.update) {
			cb(embedId, modifiedTr, stateBefore, newState, updaterSymbol)
		}
	}

	addEventListener(type: "saving" | "saved", cb: OnSaveDocumentCallback): void

	addEventListener(type: "update", cb: OnUpdateDocumentCallback): void

	addEventListener(
		type: "update" | "saving" | "saved",
		cb: OnUpdateDocumentCallback | OnSaveDocumentCallback
	): void {
		this._callbacks[type].push(cb as any)
	}

	removeEventListener(type: "saving" | "saved", cb: OnSaveDocumentCallback): void

	removeEventListener(type: "update", cb: OnUpdateDocumentCallback): void

	removeEventListener(
		type: "update" | "saving" | "saved",
		cb: OnUpdateDocumentCallback | OnSaveDocumentCallback
	): void {
		const cbIndex = this._callbacks[type].indexOf(cb as any)
		if (cbIndex === -1) {
			throw new Error("Tried to remove a callback that was not registered.")
		}
		this._callbacks[type].splice(cbIndex, 1)
	}

	unload({ docId }: DocId): void {
		this._refCounter.unload(docId)
	}

	private readonly _loading: Record<string, Promise<{ state: EditorState, data?: T }> | undefined> = {}

	async load({ docId }: DocId): Promise<{ state: EditorState, data?: T }> {
		// prevent double loading of the same document
		// this also prevents issues from non-determenistic plugin stateInit functions
		this._loading[docId] ??= this._loadInternal({ docId })

		const res = await this._loading[docId]
		if (res === undefined) unreachable()
		this._loading[docId] = undefined
		this._refCounter.load(docId, res)
		if (isProxy(res.state)) {
			throw new Error("State cannot be a reactive proxy. You can use toRaw as a temporary workaround but you should ideally not make it reactive")
		}
		this._cache.set(docId, res.state)
		return res
	}

	private async _loadInternal({ docId }: DocId): Promise<{ state: EditorState, data?: T }> {
		const cachedState = this.getFromCache({ docId }, { errorIfNotFound: false })
		if (isProxy(cachedState)) {
			throw new Error("State cannot be a reactive proxy. You can use toRaw as a temporary workaround but you should ideally not make it reactive")
		}
		if (cachedState) {
			const res = { state: cachedState }
			this._refCounter.load(docId, res)
			return res
		}

		const schema = this.editor.schema
		const loaded = await this._load(
			docId,
			schema,
			[...this.editor.extensionManager.plugins]
		)
		let state = loaded.state
		const tr = state.tr

		tr.setMeta("addToHistory", false)
		for (const plugin of state.plugins) {
			if (plugin.spec.stateInit) {
				plugin.spec.stateInit(tr)
			}
		}

		state = state.apply(tr)
		return { data: loaded.data, state }
	}

	getFullState(docId: DocId): EditorState {
		return this.getFromCache(docId, { errorIfNotFound: true })
	}

	getFromCache(docId: DocId, options?: { errorIfNotFound: true }): EditorState

	getFromCache(docId: DocId, options?: { errorIfNotFound?: boolean }): EditorState | undefined

	getFromCache({ docId }: DocId, options?: { errorIfNotFound?: boolean }): EditorState | undefined {
		const cached = this._cache.get(docId)
		if (cached) return cached
		if (options?.errorIfNotFound) {
			throw new Error(`Could not find cached state for document ${docId}. Expected document to be loaded.`)
		}
		if (isProxy(cached)) {
			throw new Error("State cannot be a reactive proxy. You can use toRaw as a temporary workaround but you should ideally not make it reactive")
		}
		return undefined
	}

	getEmbeddedContent(embedId: EmbedId): Content | undefined {
		const state = this.getFullState(embedId)
		const json = state.doc.toJSON()
		const nodeWanted = getEmbedNodeFromDoc(json, embedId.blockId)
		if (embedId.blockId && !nodeWanted) {
			return undefined
		} else {
			return getEmbedJson(nodeWanted) ?? json
		}
	}
}
