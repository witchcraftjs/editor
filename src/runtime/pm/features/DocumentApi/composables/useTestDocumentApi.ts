import { delay } from "@alanscodelog/utils/delay"
import { keys } from "@alanscodelog/utils/keys"
import { unreachable } from "@alanscodelog/utils/unreachable"
import type { Editor, EditorOptions } from "@tiptap/core"
import { createDocument, generateJSON } from "@tiptap/core"
import type { Schema } from "@tiptap/pm/model"
import type { Plugin } from "@tiptap/pm/state"
import { EditorState } from "@tiptap/pm/state"
import { initProseMirrorDoc, prosemirrorToYDoc } from "@tiptap/y-tiptap"
import { type Ref, ref, toRaw } from "vue"
import type * as Y from "yjs"

import { testExtensions } from "../../../testSchema.js"
import { createCollaborationPlugins } from "../../Collaboration/createCollaborationPlugins.js"
import { ySyncPluginKey } from "../../Collaboration/ySyncPlugin.js"
import { DocumentApi } from "../DocumentApi.js"
import type { DocumentApiInterface } from "../types.js"

type Cache = Record<string, { state?: EditorState, count: number, yDoc?: Y.Doc }>

/** Creates a simple instance of the DocumentApi for testing purposes. */
export function useTestDocumentApi(
	editorOptions: Partial<EditorOptions>,
	embeds: Record<string, { content: any, title?: string }>,
	{
		useCollab = false,
		loadDelay = 0,
		cache: providedCache
	}: {
		useCollab?: boolean
		loadDelay?: number
		/** Share this cache between multiple document apis (e.g. two views of the same doc). DO NOT pass the same instance when simulating multiple peers. */
		cache?: Ref<Cache>
	} = {}
): {
	cache: Ref<Cache>
	documentApi: DocumentApiInterface
	embeds: Record<string, { content: any, title?: string }>
} {
	const cache = providedCache ?? ref<Cache>({})

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

			options.content = cache.value[docId].state.doc.toJSON()
			return options
		},
		postEditorInit(docId, editor) {
			editor.commands.setCollabContext?.(documentApi, docId)
			const bridge = ySyncPluginKey.getState(cache.value[docId].state!)?.bridge
			if (bridge) {
				editor.commands.setCollabBridge?.(bridge)
			}
		},
		load: async (
			docId: string,
			schema: Schema,
			plugins: Plugin[],
			getConnectedEditors: () => Editor[]
		): Promise<{ state: EditorState, yDoc?: Y.Doc }> => {
			if (loadDelay) {
				await delay(loadDelay)
			}
			// just so we catch errors where we're not correctly supplying the needed embeds for testing
			if (!embeds[docId]) {
				throw new Error(`No embed found for docId ${docId} in: ${JSON.stringify(embeds, null, "\t")}`)
			}

			if (cache.value[docId]?.state) {
				return { state: toRaw(cache.value[docId].state) as any, yDoc: cache.value[docId].yDoc }
			}

			// eslint-disable-next-line @typescript-eslint/naming-convention
			const existingYDoc = cache.value[docId]?.yDoc
			const doc = existingYDoc
				? initProseMirrorDoc(existingYDoc.getXmlFragment("prosemirror"), schema as never).doc
				: createDocument(generateJSON(embeds[docId].content as any, testExtensions), schema)
			const yDoc = useCollab ? (existingYDoc ?? prosemirrorToYDoc(doc, "prosemirror")) : undefined


			const state = EditorState.create({
				doc,
				schema,
				plugins: [
					...plugins,
					...(yDoc
						? createCollaborationPlugins({
								yDoc,
								documentApi,
								docId,
								schema,
								enableContentCheck: true,
								getConnectedEditors,
								onContentError: (error: Error) => {
									alert("[collab] invalid content\n" + error)
									return undefined
								}
							})
						: [])
				]
			})

			return { state, yDoc }
		},
		refCounter: {
			load(docId: string, loaded) {
				cache.value[docId] ??= { state: loaded.state, yDoc: loaded.yDoc, count: 0 }
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
		},
		// just to silence the warning during tests
		save: import.meta.env.MODE === "test"
			? async (..._args: any[]) => { }
			: undefined
	})
	return { documentApi, cache, embeds }
}
