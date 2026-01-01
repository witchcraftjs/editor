import { delay } from "@alanscodelog/utils/delay"
import { keys } from "@alanscodelog/utils/keys"
import { unreachable } from "@alanscodelog/utils/unreachable"
import type { Editor, EditorOptions } from "@tiptap/core"
import { createDocument, generateJSON } from "@tiptap/core"
import type { Schema } from "@tiptap/pm/model"
import type { Plugin } from "@tiptap/pm/state"
import { EditorState } from "@tiptap/pm/state"
import { prosemirrorToYDoc } from "@tiptap/y-tiptap"
import { type Ref, ref, toRaw } from "vue"
import type * as Y from "yjs"

import { testExtensions } from "../../../testSchema.js"
import { Collaboration } from "../../Collaboration/Collaboration.js"
import { createCollaborationPlugins } from "../../Collaboration/createCollaborationPlugins.js"
import { DocumentApi } from "../DocumentApi.js"
import type { DocumentApiInterface } from "../types.js"

type Cache = Record<string, { state?: EditorState, count: number, yDoc?: Y.Doc }>

/** Creates a simple instance of the DocumentApi for testing purposes. */
export function useTestDocumentApi(
	editorOptions: Partial<EditorOptions>,
	embeds: Record<string, { content: any, title?: string }>,
	{
		useCollab = false,
		loadDelay = 0
	}: {
		useCollab?: boolean
		loadDelay?: number
	} = {}
): {
	cache: Ref<Cache>
	documentApi: DocumentApiInterface
	embeds: Record<string, { content: any, title?: string }>
} {
	const cache = ref<Cache>({})

	const documentApi = new DocumentApi({
		editorOptions,

		getSuggestions: async (searchString: string): Promise<{ title: string, docId: string }[]> => {
			const res = []
			for (const docId of keys(embeds)) {
				const title = embeds[docId].title ?? docId
				if (title.includes(searchString)) {
					res.push({ title, docId })
				}
			}
			if (loadDelay) {
				await delay(loadDelay)
			}
			return res
		},
		getTitle: (docId, blockId) => (embeds[docId]?.title ?? docId) + (blockId ? `#${blockId}` : ""),
		cache: {
			get(docId: string): EditorState | undefined {
				return toRaw(cache.value[docId]?.state)
			},
			set(docId: string, state: EditorState): void {
				cache.value[docId].state = state
			}
		},
		preEditorInit(docId, options: Partial<EditorOptions>) {
			if (!cache.value[docId]) unreachable()
			const yDoc = cache.value[docId].yDoc
			if (useCollab && !yDoc) unreachable()
			if (!cache.value[docId].state) unreachable()

			const perDoc = ["history"]

			options.content = cache.value[docId].state.doc.toJSON()
			options.extensions = [
				...(options.extensions ?? []).filter(ext => !perDoc.includes(ext.name)),
				...(useCollab
					? [Collaboration]
					: [])
			]
			return options
		},
		load: async (
			docId: string,
			schema: Schema,
			plugins: Plugin[],
			getConnectedEditors: () => Editor[]
		): Promise<{ state: EditorState, data?: { yDoc?: Y.Doc } }> => {
			if (loadDelay) {
				await delay(loadDelay)
			}
			// just so we catch errors where we're not correctly supplying the needed embeds for testing
			if (!embeds[docId]) {
				throw new Error(`No embed found for docId ${docId} in: ${JSON.stringify(embeds, null, "\t")}`)
			}

			if (cache.value[docId]?.state) {
				return { state: toRaw(cache.value[docId].state) as any, data: { yDoc: cache.value[docId].yDoc } }
			}

			const json = generateJSON(embeds[docId].content as any, testExtensions)
			const doc = createDocument(json, schema)
			const yDoc = useCollab ? prosemirrorToYDoc(doc, "prosemirror") : undefined

			const state = EditorState.create({
				doc,
				schema,
				plugins: [
					...plugins,
					...(useCollab
						? createCollaborationPlugins(
								{
									document: yDoc,
									field: "prosemirror",
									enableContentCheck: true
								},
								schema,
								getConnectedEditors
							)
						: [])
				]
			})

			return { state, data: { yDoc } } as any
		},
		refCounter: {
			load(docId: string, loaded) {
				// loaded.data can be accessed here if we need it
				cache.value[docId] ??= { ...loaded, yDoc: loaded.data!.yDoc, count: 0 }
				cache.value[docId].count++
			},
			unload: (docId: string) => {
				if (cache.value[docId]) {
					if (cache.value[docId].count === 1) {
						delete cache.value[docId]
					} else {
						cache.value[docId].count--
					}
				} else {
					unreachable()
				}
			}
		}
	})
	return { documentApi, cache, embeds }
}
