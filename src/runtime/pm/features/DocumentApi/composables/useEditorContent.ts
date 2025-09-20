import type { Content, Editor, EditorOptions } from "@tiptap/core"
import type { Transaction } from "@tiptap/pm/state"
import { nextTick, onBeforeUnmount, type Ref, type ShallowRef, watch } from "vue"

import type { DocumentApiInterface, OnUpdateDocumentCallback } from "../types.js"
import { convertTrForInstance } from "../utils/convertTrForInstance.js"

/**
	* Provides two ways to load content into the editor.
	*
	* The simple one, which is just to provide a content ref.
	*
	* And the more advanced one which uses the document api to load the content. This requires passing the embed api and an id to load.
	*
	* The second option is usually the best, as multiple editors can load the same content and it's automatically kept in sync. See {@link DocumentApi} for more info.
	*/
export function useEditorContent(
	editor: ShallowRef<Editor | undefined>,
	content: Ref<Content | undefined>,
	id: Ref<string | undefined>,
	documentApi: DocumentApiInterface | undefined,
	recreate: (modifyOptions?: (options: Partial<EditorOptions>) => Partial<EditorOptions>) => void
): void {
	const selfSymbol = Symbol(`self${Math.random()}`)
	function onTransaction({ transaction: tr }: { transaction: Transaction }): void {
		if (!documentApi || !id.value || !tr.docChanged || tr.getMeta("ignore")) {
			return
		}
		tr.setMeta("no-step-convert", true)
		documentApi.updateDocument({ docId: id.value }, tr, selfSymbol)
	}
	const onUpdateDocument: OnUpdateDocumentCallback = (embedId, tr, __, ___, symbol) => {
		if (symbol !== selfSymbol
			&& !tr.getMeta("ignore")
			&& tr.docChanged
			&& embedId.docId === id.value
		) {
			tr.setMeta("ignore", true)
			const convertedTr = convertTrForInstance(
				tr,
				editor.value!.state
			)
			editor.value?.view.dispatch(convertedTr)
		}
		if (tr.docChanged) {
			void documentApi?.save(embedId.docId)
		}
	}
	let attached = false

	async function load(changed: boolean): Promise<void> {
		if (content.value) {
			editor.value?.commands.setContent(content.value)
		} else if (documentApi) {
			if (changed && id.value) {
				await documentApi.load({ docId: id.value })
				const state = documentApi.getFullState({ docId: id.value })

				recreate(options => documentApi.preEditorInit?.(id.value!, { ...options }, state))
				await nextTick(async () => {
					editor.value!.on("transaction", onTransaction)
					documentApi!.addEventListener("update", onUpdateDocument)
					documentApi.postEditorInit(id.value!, editor.value!)
					attached = true
				})
			}
		}
	}
	function unload(oldId: string): void {
		if (oldId !== undefined && documentApi) {
			documentApi.unload({ docId: oldId })
			if (attached) {
				documentApi.removeEventListener("update", onUpdateDocument)
				editor.value?.off("transaction", onTransaction)
				attached = false
			}
		}
	}

	watch([content, id, editor], async ([_newContent, newId], [_oldContent, oldId]) => {
		if (!editor.value) {
			return
		}
		if (!content.value && (!id.value || !documentApi)) {
			throw new Error("No content or id and document api provided.")
		}
		if (id.value && !documentApi) {
			throw new Error("Id provided but no document api provided.")
		}

		if (oldId !== undefined && newId !== oldId && documentApi) {
			unload(oldId)
			await load(true)
		} else if (_newContent) {
			await load(false)
		}
	}, { deep: false })

	void load(true)
	onBeforeUnmount(() => {
		if (id.value) {
			unload(id.value)
		}
	})
}
