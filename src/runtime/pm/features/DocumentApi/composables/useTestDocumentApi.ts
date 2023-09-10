import { delay } from "@alanscodelog/utils/delay"
import { keys } from "@alanscodelog/utils/keys"
import { unreachable } from "@alanscodelog/utils/unreachable"
import type { EditorOptions } from "@tiptap/core"
import { createDocument, generateJSON } from "@tiptap/core"
import type { Schema } from "@tiptap/pm/model"
import type { Plugin } from "@tiptap/pm/state"
import { EditorState } from "@tiptap/pm/state"
import { type Ref, ref, toRaw } from "vue"

import { testExtensions } from "../../../testSchema.js"
import { DocumentApi } from "../DocumentApi.js"
import type { DocumentApiInterface } from "../types.js"

type Cache = Record<string, { state?: EditorState, count: number }>

/** Creates a simple instance of the DocumentApi for testing purposes. */
export function useTestDocumentApi(
	editorOptions: Partial<EditorOptions>,
	embeds: Record<string, { content: any, title?: string }>,
	{ loadDelay = 0 }: { loadDelay?: number } = { }
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
		load: async (
			docId: string,
			schema: Schema,
			plugins: Plugin[]
		): Promise<{ state: EditorState }> => {
			if (loadDelay) {
				await delay(loadDelay)
			}
			// just so we catch errors where we're not correctly supplying the needed embeds for testing
			if (!embeds[docId]) {
				throw new Error(`No embed found for docId ${docId} in: ${JSON.stringify(embeds, null, "\t")}`)
			}

			const json = generateJSON(embeds[docId].content as any, testExtensions)
			const doc = createDocument(json, schema)
			const state = EditorState.create({
				doc,
				schema,
				plugins
			})
			return { state }
		},
		refCounter: {
			load(docId: string, loaded) {
				cache.value[docId] ??= { ...loaded, count: 0 }
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
