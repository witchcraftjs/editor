<template>
<!-- v-if is to prevent styles from existing/getting applied to other documents when the popup is hidden, and also not having v-if on the editor causes problems with prosemirror -->
<div
	v-if="isShown"
	class="
		embedded-document-picker
		w-[calc(100dvw-var(--spacing-20))]
		max-h-[calc(100dvh-var(--spacing-20))]
		overflow-auto
		bg-neutral-100
		dark:bg-neutral-900
		p-2
		rounded-sm
		flex-1
		flex
		flex-col
		gap-2
	"
>
	<component
		:is="'style'"
	>
		.embedded-document-picker li[blockid="{{ newEmbedId.blockId }}"]:not(:has(li:hover)):after {
		border-color: rgb(var(--color-accent-500));
		}
		.embedded-document-picker li[blockid="{{ newEmbedId.blockId }}"]:has(li:hover):after {
		border-color: rgb(var(--color-accent-500)/50%);
		}
	</component>
	<!-- @vue-expect-error -->
	<WSimpleInput
		placeholder="Change document."
		suggestions-class="max-h-[200px] overflow-y-auto"
		:suggestions="searchSuggestions"
		:suggestion-label="(suggestion:any) => suggestion.title"
		:restrict-to-suggestions="false"
		ref="inputComponent"
		v-model="searchString"
		@submit="pickDocId"
	>
		<!-- @vue-expect-error -->
		<template
			v-if="searchLoading"
			#right
		>
			<WIcon><i-line-md-loading-loop/></WIcon>
		</template>
		<!-- @vue-expect-error -->
		<template #suggestion-item="{ item }">
			{{ item.title }}
		</template>
	</WSimpleInput>
	<WCheckbox v-model="embedFullDocument">
		Embed Full Document
	</WCheckbox>
	<div
		v-if="!embedFullDocument && newEmbedId.docId"
		class="border border-neutral-500 rounded-sm"
	>
		<div class="bg-neutral-200 dark:bg-neutral-800 rounded-t-sm p-1">
			Pick a block to embed:
		</div>
		<div
			class="
			flex-1
			[&_li]:after:rounded-sm
			[&_li]:after:border-2
			[&_li]:after:border-transparent
			[&_li]:after:content-['']
			[&_li]:after:absolute
			[&_li]:after:inset-[-3px]
			[&_li]:after:transition-all
			[&_li]:cursor-pointer
			[&_li]:after:pointer-events-none
			[&_li:hover:not(:has(li:hover))]:after:content-['']
			[&_li:hover:not(:has(li:hover))]:after:border-accent-500
			[&_li:hover:not(:has(li:hover))]:after:bg-accent-500/30
			[&_li:hover:not(:has(li:hover))]:after:pointer-events-none
			[&_li:hover:not(:has(li:hover))]:pointer-events-all
			[&_a]:pointer-events-none
			overflow-y-auto
			p-2
		"
			@pointerdown.prevent
			@pointerup.prevent="pickBlockId"
		>
			<Editor
				:is-embedded="true"
				:doc-id="newEmbedId.docId"
				:editor-options="{ editable: false }"
			/>
		</div>
	</div>
	<div class="flex flex-row no-wrap gap-2 justify-end">
		<WButton
			color="danger"
			@click="emit('cancel')"
		>
			Cancel
		</WButton>
		<WButton
			color="ok"
			@click="submit"
		>
			Submit
		</WButton>
	</div>
</div>
</template>

<script setup lang="ts">
import WIcon from "@witchcraft/ui/components/Icon"
import WButton from "@witchcraft/ui/components/LibButton"
import WCheckbox from "@witchcraft/ui/components/LibCheckbox"
import type WInputDeprecated from "@witchcraft/ui/components/LibInputDeprecated"
import WSimpleInput from "@witchcraft/ui/components/LibSimpleInput"
import { inject, nextTick, provide, ref, toRef, watch } from "vue"

import ILineMdLoadingLoop from "~icons/line-md/loading-loop"

import Editor from "../../../../components/Editor.vue"
import { documentApiInjectionKey, type MaybeEmbedId } from "../../DocumentApi/types.js"
import { isDeepEmbeddedInjectionKey } from "../types.js"

const props = defineProps<{
	embedId: MaybeEmbedId
	/** We need this, otherwise prosemirror? gets in an infinite loop because the component is not actually displayed? I think... Chrome debugger freezes completely. */
	isShown: boolean
}>()
const emit = defineEmits<{
	(e: "submit", embedId: MaybeEmbedId): void
	(e: "cancel"): void
}>()

const embedId = toRef(props, "embedId")
const newEmbedId = ref<MaybeEmbedId>({ ...props.embedId })
// const editorComponent = inject(embeddedEditorComponentInjectionKey, Editor)
const documentApi = inject(documentApiInjectionKey)

// make this work like an un-embedded editor
provide(isDeepEmbeddedInjectionKey, true)

function pickBlockId(e: MouseEvent) {
	const el = e.target as HTMLElement
	const item = el.closest(".item-content")
	const id = item?.getAttribute("blockid")
	if (id) {
		newEmbedId.value.blockId = id
	}
}

// bit of an ugly hack but it works
const justPicked = ref(false)
const inputComponent = ref<InstanceType<typeof WInputDeprecated> | null>(null)
const searchString = ref("")
const searchLoading = ref(false)
const searchSuggestions = ref<{ title: string, docId: string }[]>([])
watch(searchString, async newVal => {
	if (justPicked.value) return
	searchLoading.value = true
	inputComponent.value?.suggestionsComponent?.suggestions.close()
	searchSuggestions.value	= await documentApi!.getSuggestions(newVal)
	inputComponent.value?.suggestionsComponent?.suggestions.open()
	searchLoading.value = false
}, { immediate: true })

function pickDocId(_val: string, suggestion?: { docId: string, title: string }) {
	if (suggestion?.docId) {
		newEmbedId.value.docId = suggestion.docId
		justPicked.value = true
		nextTick(() => {
			justPicked.value = false
		})
	}
}

const embedFullDocument = ref(embedId.value.blockId === undefined)
function submit() {
	if (embedFullDocument.value) {
		emit("submit", { ...newEmbedId.value, blockId: undefined })
	} else {
		emit("submit", newEmbedId.value)
	}
}
</script>
