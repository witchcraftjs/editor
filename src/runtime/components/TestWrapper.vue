<template>
<WRoot :test-wrapper-mode="true">
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
import WRoot from "@witchcraft/ui/components/LibRoot"
import { ref, watchEffect } from "vue"

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
const { documentApi } = useTestDocumentApi(
	editorOptions as any,
	props.documents,
	{ loadDelay: props.loadDelay }

)

const linkOptions: EditorLinkOptions = {
	openInternal: () => {
		// eslint-disable-next-line no-console
		console.log("openning internal")
	}
}
const editor = ref<TipTapEditor | null>(null)

watchEffect(() => {
	if (editor.value) {
		// todo declare global
		;(window as any)[`editor-${props.testId}`] = editor.value
	}
})
</script>

<style>
@reference "../demo/tailwind.css"
</style>
