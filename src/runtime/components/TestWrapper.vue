<template>
<WRoot
	:test-wrapper-mode="true"
	:use-notifications="false"
>
	<Editor
		:data-testid="`test-editor-${testId}`"
		ref="editor"
		v-bind="{
			docId,
			documentApi,
			linkOptions,
			editorOptions
		}"
	/>
	<div class="py-[50px]"/>
</WRoot>
</template>

<script setup lang="ts">
import type { Editor as TipTapEditor, EditorOptions } from "@tiptap/core"
import WRoot from "@witchcraft/ui/components/WRoot"
import { onBeforeUnmount, ref, watchEffect } from "vue"

import Editor from "./Editor.vue"

import { useTestDocumentApi } from "../pm/features/DocumentApi/composables/useTestDocumentApi.js"
import type { EditorLinkOptions } from "../pm/features/Link/types.js"
import { testExtensions } from "../pm/testSchema.js"

const props = defineProps<{
	// helps ensure we don't have problems with tests when one fails (unmount is never called and the next test gets confused, things there's duplicate elements)
	testId: string
	documents: Record<string, { title: string, content: string }>
	docId: string
	loadDelay?: number
	useCollab?: boolean
	/** If provided, this document api is used instead of creating a new one. Used to test multiple editors sharing the same document. */
	documentApi?: any
	/** Share this cache between multiple wrappers (e.g. two peers of the same doc). When an entry already has a yDoc, it is reused instead of creating one from content. */
	cache?: any
	/** Namespace prefix for the window globals (editor-/documentApi-/cache- keys) so multiple wrappers can't collide. */
	ns?: string
}>()

const editorOptions: Partial<EditorOptions> = {
	extensions: testExtensions.map(ext => {
		if (ext.name === "item") {
			return ext.configure({
				ensureLastItemIsParagraph: false
			} as any)
		}
		return ext
	}) as any,
	enableCoreExtensions: {
		keymap: false
	}
}
const { documentApi: createdDocumentApi, cache: createdCache } = useTestDocumentApi(
	editorOptions as any,
	props.documents,
	{ loadDelay: props.loadDelay, useCollab: props.useCollab, cache: props.cache }

)
const documentApi = props.documentApi ?? createdDocumentApi

const linkOptions: EditorLinkOptions = {
	openInternal: () => {
		// eslint-disable-next-line no-console
		console.log("openning internal")
	}
}
const editor = ref<TipTapEditor | null>(null)

// window global keys, optionally namespaced so multiple wrappers can't collide
const nsPrefix = props.ns ? `${props.ns}.` : ""

watchEffect(() => {
	if (editor.value) {
		// todo declare global
		;(window as any)[`${nsPrefix}editor-${props.testId}`] = editor.value
	}
})

// expose the document api and cache so tests can share them between wrappers
;(window as any)[`${nsPrefix}documentApi-${props.testId}`] = documentApi
;(window as any)[`${nsPrefix}cache-${props.testId}`] = createdCache

// clean up the window globals on unmount so stale references from a previous test don't leak into the next one
onBeforeUnmount(() => {
	delete (window as any)[`${nsPrefix}editor-${props.testId}`]
	delete (window as any)[`${nsPrefix}documentApi-${props.testId}`]
	delete (window as any)[`${nsPrefix}cache-${props.testId}`]
})
</script>

<style>
@reference "../demo/tailwind.css"
</style>
