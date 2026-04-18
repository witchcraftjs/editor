<template>
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

<WPopup
	:use-backdrop="true"
	class="backdrop:bg-neutral-900/50 backdrop:dark:bg-neutral-100/50"
	:title="embedId.blockId ? 'Change Embed' : 'Add Embed'"
	:content-props="{
		class: `
			rounded-md
			[&_.popup--content-inner]:w-[700px]
			[&_.popup--content-inner]:max-w-[calc(100dvw-var(--spacing)*20)]
			[&_.popup--content-inner]:max-h-[calc(100dvh-var(--spacing)*20)]
			[&_.popup--content-inner]:overscroll-y-auto
			[&_.popup--content-inner]:bg-neutral-100
			[&_.popup--content-inner]:dark:bg-neutral-900
			[&_.popup--content-inner]:p-2
			[&_.popup--content-inner]:flex
			[&_.popup--content-inner]:flex-col
		`,
		['aria-describedby']: undefined
	}"
	v-model="isShown"
>
	<template #button>
		<WButton
			v-if="isEditable"
			title="Change embed link."
			:border="true"
			@click="isShown = true"
		>
			<WIcon><IconLink class="w-[0.7rem]"/></WIcon>
		</WButton>
	</template>
	<template #extra>
		<!-- v-if is to prevent styles from existing/getting applied to other documents when the popup is hidden, and also not having v-if on the editor causes problems with prosemirror -->
		<div
			v-if="isShown"
			class="
				embedded-document-picker
				shrink-1
				min-h-0
				flex
				flex-col
				gap-2
			"
		>
			<WCombobox
				:input-props="{ placeholder: 'Search Documents' }"
				:suggestions="searchSuggestions"
				:display-entry="_ => _.title"
				:loading="searchLoading"
				v-model:search-term="searchTerm"
				@update:model-value="pickDocId"
			/>
			<WCheckbox v-model="embedFullDocument">
				Embed Full Document
			</WCheckbox>
			<div
				v-if="!embedFullDocument && newEmbedId.docId"
				class="border border-neutral-500 rounded-sm shrink-1 min-h-0 flex flex-col"
			>
				<div class="bg-neutral-200 dark:bg-neutral-800 rounded-t-sm p-1">
					Pick a block to embed:
				</div>
				<div
					class="
						flex-1
						min-h-0
						overflow-y-auto
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
		</div>
	</template>
	<template #close>
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
	</template>
</WPopup>
</template>

<script setup lang="ts">
import WButton from "@witchcraft/ui/components/WButton"
import WCheckbox from "@witchcraft/ui/components/WCheckbox"
import WCombobox from "@witchcraft/ui/components/WCombobox"
import WIcon from "@witchcraft/ui/components/WIcon"
import WPopup from "@witchcraft/ui/components/WPopup"
import { inject, nextTick, provide, ref, toRef, watch } from "vue"

import IconLink from "~icons/lucide/link"

import Editor from "../../../../components/Editor.vue"
import { documentApiInjectionKey, type MaybeEmbedId } from "../../DocumentApi/types.js"
import { isDeepEmbeddedInjectionKey } from "../types.js"

const props = defineProps<{
	embedId: MaybeEmbedId
	isEditable: boolean
	/** We need this, otherwise prosemirror? gets in an infinite loop because the component is not actually displayed? I think... Chrome debugger freezes completely. */
}>()
const isShown = defineModel<boolean>({ default: false })
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

// bit of an ugly hack to avoid searching when we just picked but it works
const justPicked = ref(false)
const searchTerm = ref("")
const searchLoading = ref(false)
const searchSuggestions = ref<{ title: string, docId: string }[]>([])
watch(searchTerm, async newVal => {
	if (justPicked.value) return
	searchLoading.value = true
	searchSuggestions.value	= await documentApi!.getSuggestions(newVal)
	searchLoading.value = false
})

function pickDocId(suggestion?: { docId: string, title: string }) {
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
