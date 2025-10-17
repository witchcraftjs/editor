<template>
<!-- @vue-expect-error -->
<node-view-wrapper
	:class="`
		group/embedded-doc
		relative
		after:pointer-events-none
		after:content-['']
		after:absolute after:inset-0
		after:border after:border-neutral-500 after:rounded-sm
		after:drop-shadow-xs
		focus-within:after:border-accent-500
		focus:after:border-accent-500
	`"
	tabindex="0"
	v-bind="{
		...node.attrs,
		embedId: undefined,
		embedDocId: node.attrs.embedId.docId,
		embedBlockId: node.attrs.embedId.blockId
	}"
	@pointerdown="setEditorSelection"
>
	<div
		class="text-sm relative"
		contenteditable="false"
	>
		<div
			class="bg-neutral-100 dark:bg-neutral-900 flex p-1 gap-2 no-wrap justify-between items-center"
			contenteditable="false"
		>
			<div
				v-if="name"
				class="pl-1"
			>
				File: {{ name }}
			</div>
			<div
				v-else
				class="pl-1 text-center w-full"
			>
				Blank Embed
			</div>
			<WButton
				v-if="editor?.isEditable"
				title="Change embed link."
				:border="true"
				@click="showChangeEmbed = true"
			>
				<WIcon><i-fa-solid-link class="w-[0.7rem]"/></WIcon>
			</WButton>
			<WPopup
				:use-backdrop="true"
				:preferred-horizontal="['center-screen']"
				:preferred-vertical="['center-screen']"
				class="backdrop:bg-neutral-900/50 backdrop:dark:bg-neutral-100/50"
				v-model="showChangeEmbed"
			>
				<template #popup="{	extractEl }">
					<EmbeddedDocumentPicker
						:is-shown="showChangeEmbed"
						:embed-id="embedId"
						v-extract-root-el="extractEl"
						@submit="pickEmbed"
						@cancel="showChangeEmbed = false"
					/>
				</template>
				>
			</WPopup>
		</div>
		<Transition>
			<div
				v-if="showUndoWarning"
				class="absolute inset-0 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 px-2"
				contenteditable="false"
			>
				Warning: Undo applied to document part that is not visible/embedded.
			</div>
		</Transition>
	</div>

	<div v-if="!name"/>
	<div
		v-else-if="isEmbeddedTooDeep"
		class="px-2 text-center"
		contenteditable="false"
	>
		Cannot preview nested content deeper than one level.
	</div>
	<div
		v-else-if="isRecursivelyEmbedded"
		class="px-2 text-center"
		contenteditable="false"
	>
		Cannot preview recursively embedded content.
	</div>

	<template
		v-else-if="content"
	>
		<component
			:is-embedded="true"
			:content="content"
			:editor-options="editorOptions"
			:is="editorComponent"
			ref="editorWrapper"
		/>
	</template>
	<div
		v-else
		class="px-2 text-center"
	>
		{{ isLoading ? "Loading..." : "Could not find reference to wanted block." }}
	</div>
</node-view-wrapper>
</template>

<script setup lang="ts">
import { nodeViewProps, NodeViewWrapper } from "@tiptap/vue-3"
import WIcon from "@witchcraft/ui/components/Icon"
import WButton from "@witchcraft/ui/components/LibButton"
import WPopup from "@witchcraft/ui/components/LibPopup"
import { vExtractRootEl } from "@witchcraft/ui/directives/vExtractRootEl"
import { computed, inject, ref, watch } from "vue"

import EmbeddedDocumentPicker from "./EmbeddedDocumentPicker.vue"

import IFaSolidLink from "~icons/fa-solid/link"

import Editor from "../../../../components/Editor.vue"
import type { MaybeEmbedId } from "../../DocumentApi/types.js"
import { useEmbeddedEditor } from "../composables/useEmbeddedEditor.js"
import { embeddedEditorComponentInjectionKey } from "../types.js"

const props = defineProps(nodeViewProps)

const editorComponent = inject(embeddedEditorComponentInjectionKey, Editor)
const editorWrapper = ref<InstanceType<typeof Editor> | null>(null)
// const el = ref<HTMLElement | null>(null)
const innerEditor = computed(() => editorWrapper.value?.editor)

const embedId = computed(() => props.node.attrs.embedId as MaybeEmbedId)
const showChangeEmbed = ref(false)

function pickEmbed(newEmbedId: MaybeEmbedId): void {
	showChangeEmbed.value = false
	props.updateAttributes({ ...props.node.attrs, embedId: { ...newEmbedId } })
}

function setEditorSelection(): void {
	const pos = props.getPos()
	if (props.editor.state.selection.from !== pos && pos) {
		props.editor?.commands.setNodeSelection(pos)
	}
}

function autoFocusOnSelection(): void {
	if (props.editor.state.selection.from === props.getPos()
		&& document.activeElement !== innerEditor.value?.view.dom
	) {
		innerEditor.value?.commands.focus()
	}
}

watch([() => props.editor.state.selection.from, innerEditor], () => {
	autoFocusOnSelection()
})

const {
	content,
	// api,
	isEmbeddedTooDeep,
	// isEmbeddedBlock,
	isRecursivelyEmbedded,
	showUndoWarning,
	name,
	isLoading,
	editorOptions
} = useEmbeddedEditor(
	embedId,
	innerEditor,
	props.editor,
	props.getPos
)
</script>
