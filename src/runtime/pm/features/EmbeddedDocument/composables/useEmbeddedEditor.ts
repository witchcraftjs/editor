import { castType } from "@alanscodelog/utils/castType"
import type { Content, Editor, EditorOptions } from "@tiptap/core"
import type { EditorState, Transaction } from "@tiptap/pm/state"
import { computed, type ComputedRef, inject, onBeforeUnmount, onMounted, provide, type Ref, ref, type ShallowRef, watch } from "vue"

import { getDiffReplacementRange } from "../../../utils/getDiffReplacementRange.js"
import { type DocId, documentApiInjectionKey, type DocumentApiInterface, type EmbedId, type MaybeEmbedId, type OnUpdateDocumentCallback } from "../../DocumentApi/types.js"
import { convertFullTransactionForPartialState } from "../../DocumentApi/utils/convertFullTransactionForPartialState.js"
import { getStateEmbedRange } from "../../DocumentApi/utils/getStateEmbedRange.js"
import { isEmbedId } from "../../DocumentApi/utils/isEmbedId.js"
import { Embedded } from "../Embedded.js"
import { embededEditorOptionsInjectionKey, isDeepEmbeddedInjectionKey, isEmbeddedBlockInjectionKey, isEmbeddedInjectionKey, parentEditorIdInjectionKey } from "../types.js"

type WarningState = {
	smallTimeout: number | undefined
	timeout: number | undefined
	justWarned: boolean
}

function defaultOnUndoWarning(
	r: Ref<boolean>,
	state: WarningState,
	undoTimeouts: [number, number] = [50, 2000]
): void {
	clearTimeout(state.smallTimeout)
	clearTimeout(state.timeout)
	r.value = false
	// the key is getting held
	if (state.justWarned) {
		r.value = true
	}
	state.justWarned = true

	// makes it do a little flash
	state.smallTimeout = setTimeout(() => {
		state.justWarned = false
		r.value = true
		clearTimeout(state.timeout)
		state.timeout = setTimeout(() => {
			r.value = false
		}, undoTimeouts[1]) as any as number
	}, undoTimeouts[0]) as any as number
}
function defaultOnUndoOk(r: Ref<boolean>, state: WarningState): void {
	clearTimeout(state.smallTimeout)
	clearTimeout(state.timeout)
	r.value = false
}

/** Sets up nearly everything for the embedded editor nodeview. */
export function useEmbeddedEditor(
	embedIdRef: ComputedRef<MaybeEmbedId> | Ref<MaybeEmbedId>,
	/* The embedded editor instance. */
	editor: ShallowRef<Editor | undefined>,
	/* The root editor instance, for forwarding commands the embedded editor can't handle. See {@link Embedded}. */
	rootEditor: Editor,
	/** For forwarding commands the embedded editor can't handle. See {@link Embedded}. */
	getPos: () => number | undefined,
	{
		undoTimeouts = [50, 2000],
		selfSymbol = Symbol(`embedded-editor`),
		onUndoWarning,
		onUndoOk,
		alwaysLoad = false,
		injectIsEmbedded = true,
		injectIsDeepEmbedded = true
	}: {
		/* The small and normal timeouts for the default undo warning functions. */
		undoTimeouts?: [number, number]

		/* This function will be called with the returned undoWarning ref when an undo would happen outside the embedded block.
			*
			* The default function will set the ref to false for 50ms (the small timeout), then true for 2000 (the normal timeout) so there is a brief flash with each undo. If it's called again before the 50ms, it will set the ref to true, so as to not flash when the undo key is held.
			*/
		onUndoWarning?: ((ref: Ref<boolean>) => void)
		/* This function will be called with the returned undoWarning ref when an undo would happen inside the embedded block.
			*
			* The default function will set the ref to false and clear the timeouts of the default warning function.
			* */
		onUndoOk?: ((ref: Ref<boolean>) => void)
		/* A symbol to identify the embedded node view instance by. */
		selfSymbol?: symbol
		/** By default, documents will not be loaded if they are embedded too deeply or recursively embedded. Passing true will ignore all checks and load them anyways. This also usually requires disabling the injections with the `injectIsEmbedded` and `injectIsDeepEmbedded` options. */
		alwaysLoad?: boolean
		/** By default, the composable injects the `isEmbedded*InjectionKey`s. Passing false will not inject them. */
		injectIsEmbedded?: boolean
		/** By default, the composable injects `isDeepEmbeddedInjectionKey` with true if it is false. Passing false will not inject it. */
		injectIsDeepEmbedded?: boolean
	} = {}
): {
	content: Ref<Content | null>
	api: DocumentApiInterface
	selfSymbol: symbol
	isEmbeddedTooDeep: boolean
	isEmbeddedBlock?: Ref<boolean>
	isRecursivelyEmbedded: ComputedRef<boolean>
	showUndoWarning: Ref<boolean>
	/** If name is undefined, the embed is a new embed without a document id. */
	name: ComputedRef<string | undefined>
	isLoading: Ref<boolean>
	/** The root editor needs to provide it's options so we can pass them to the embedded editor. If we don't, extra extensions (e.g. BaseShortcuts) and options won't be registered on the embedded editor. See the `embeddedEditorOptionsInjectionKey` for why `autofocus` is ommitted. */
	editorOptions: Partial<Omit<EditorOptions, "autofocus">>
} {
	const showUndoWarning = ref(false)
	const content = ref<Content | null>(null)
	const api = inject(documentApiInjectionKey)
	if (!api) {
		throw new Error("No embed api provided.")
	}

	const editorOptions = inject(embededEditorOptionsInjectionKey)
	if (!editorOptions) {
		throw new Error("No editor options provided.")
	}
	editorOptions.extensions = [
		...(editorOptions.extensions ?? []).filter(ext => ext.name !== Embedded.name),
		Embedded.configure({
			rootEditor,
			getPos,
			getEmbedId: () => embedIdRef.value
		})
	]

	const isEmbeddedTooDeep = inject(isDeepEmbeddedInjectionKey, false)
	if (injectIsDeepEmbedded && !isEmbeddedTooDeep) {
		provide(isDeepEmbeddedInjectionKey, true)
	}
	const isEmbeddedBlock = computed(() => !!embedIdRef.value.blockId)
	if (injectIsEmbedded) {
		provide(isEmbeddedInjectionKey, true)
		provide(isEmbeddedBlockInjectionKey, isEmbeddedBlock)
	}

	const parentId = inject(parentEditorIdInjectionKey, undefined)
	const isRecursivelyEmbedded = computed(() => parentId?.value === embedIdRef.value.docId)

	const isLoading = ref(false)

	const name = computed(() => isEmbedId(embedIdRef.value) ? api.getEmbedTitle(embedIdRef.value) : undefined)

	const warningState: WarningState = {
		smallTimeout: undefined,
		timeout: undefined,
		justWarned: false
	}
	function forwardDispatchToFullState(tr?: Transaction): void {
		castType<EmbedId>(embedIdRef.value)
		const stateBefore = api!.getFromCache(embedIdRef.value)
		if (!stateBefore) {
			throw new Error("Expected stateBefore to exist.")
		}
		if (!tr) return
		const diff = getDiffReplacementRange(stateBefore.doc, tr.doc)
		const { start, end } = getStateEmbedRange(tr.doc, embedIdRef.value)
		if (diff && end !== undefined && start !== undefined
			&& (diff.start < start || diff.end > end)
		) {
			onUndoWarning
				? onUndoWarning(showUndoWarning)
				: defaultOnUndoWarning(showUndoWarning, warningState, undoTimeouts)
		} else {
			onUndoOk
				? onUndoOk(showUndoWarning)
				: defaultOnUndoOk(showUndoWarning, warningState)
		}
		// forwarded transactions bypass the on transaction hook
		// so we set ignore to false
		// and don't pass our symbol here
		// so we can receive the transaction and update the embedded document
		// we also don't convert the transaction's steps
		tr.setMeta("no-step-convert", true)
		tr.setMeta("no-schema-convert", true)
		if (!embedIdRef.value.blockId) {
			tr.setMeta("no-step-convert", true)
		}
		api!.updateDocument?.(
			embedIdRef.value,
			tr,
			undefined
		)
	}
	function onTransaction({ transaction }: { transaction: Transaction }): void {
		castType<EmbedId>(embedIdRef.value)
		if (!transaction.docChanged || transaction.getMeta("ignore")) {
			return
		}
		if (!embedIdRef.value.blockId) {
			transaction.setMeta("no-step-convert", true)
		}
		api!.updateDocument?.(
			embedIdRef.value,
			transaction,
			selfSymbol
		)
	}

	const onUpdateDocument: OnUpdateDocumentCallback = (
		incomingEmbedId: DocId,
		tr: Transaction,
		_stateBefore: EditorState,
		_incomingState: EditorState,
		incomingSelfSymbol?: symbol
	): void => {
		castType<EmbedId>(embedIdRef.value)
		if (
			incomingSelfSymbol === selfSymbol
			|| embedIdRef.value.docId !== incomingEmbedId.docId
			|| !tr.docChanged
			|| tr.getMeta("ignore")
		) {
			return
		}
		if (content.value) {
			const convertedTr = convertFullTransactionForPartialState(
				editor.value!.state!,
				tr,
				embedIdRef.value
			)
			if (convertedTr) {
				if (!convertedTr.before.eq(editor.value!.state.doc)) {
					return
				}
				editor.value!.view.dispatch(convertedTr)
			} else {
				// the link got broken, the node was deleted
				unloadDocument(embedIdRef.value, { partial: true })
			}
		} else {
			void loadDocument(embedIdRef.value, { partial: true })
		}
	}
	let attached = false
	async function loadDocument(embedId: MaybeEmbedId, { partial = false }: { partial?: boolean } = {}): Promise<void> {
		if (!isEmbedId(embedId)) return
		if (!alwaysLoad && (isRecursivelyEmbedded.value || isEmbeddedTooDeep)) return
		if (!partial) {
			isLoading.value = true
			await api!.load(embedId)
		}
		const res = api!.getEmbeddedContent?.(embedId)
		if (!res) return
		if (!partial) {
			api!.addEventListener?.("update", onUpdateDocument)
		}
		content.value = res

		watch(editor, () => {
			// void nextTick(() => {
			// this needs to be set if the document changes
			// because the editor gets unmounted and
			// a new version of the extension
			// without the callbacks is created
			editor.value!.commands.setHistoryRedirect(
				() => api!.getFromCache(embedId),
				forwardDispatchToFullState
			)
			// wait for the editor to exist
			editor.value?.on("transaction", onTransaction)
			isLoading.value = false
			attached = true
		}, { once: true })
	}
	function unloadDocument(embedId: MaybeEmbedId, { partial = false }: { partial?: boolean } = {}): void {
		if (!isEmbedId(embedId)) return
		if (!alwaysLoad && (isRecursivelyEmbedded.value || isEmbeddedTooDeep)) return
		editor.value?.off("transaction", onTransaction)
		if (!partial && attached) {
			api!.removeEventListener?.("update", onUpdateDocument)
			api!.unload(embedId)
			attached = false
		}
		// the extension is destroyed when the editor is unmounted
		editor.value?.commands.setHistoryRedirect(undefined, undefined)
		content.value = null
	}

	watch(embedIdRef, (newVal, oldVal) => {
		if (newVal.docId !== oldVal.docId || newVal.blockId !== oldVal.blockId) {
			unloadDocument(oldVal)
			void loadDocument(newVal)
		}
	})

	onMounted(async () => {
		await loadDocument(embedIdRef.value)
	})
	onBeforeUnmount(() => {
		unloadDocument(embedIdRef.value)
	})
	return {
		content,
		api,
		selfSymbol,
		isEmbeddedTooDeep,
		isEmbeddedBlock,
		isRecursivelyEmbedded,
		showUndoWarning,
		name,
		isLoading,
		editorOptions
	}
}
