<template>
<div
	class="
		grid
		[grid-template-columns:repeat(3,min-content)]
		gap-1
	"
	ref="el"
>
	<WIcon
		aria-label="Internal Link Text"
		class="flex items-center"
	>
		<IconText/>
	</WIcon>
	<WSimpleInput
		aria-label="Link Text"
		:valid="linkText !== ''"
		:border="false"
		class="
			link-text-input
			border-b
			border-neutral-300
			dark:border-neutral-700
			focus:border-accent-500
			rounded-none
			after:rounded-none
		"
		v-model="linkText"
		@keydown.enter="saveChanges"
		@keydown.escape="emit('close')"
	/>
	<BubbleMenuLinkActions
		:link-mark="linkMark"
		:is-changed="isChanged"
		@save="saveChanges"
		@copy="emit('copy', $event)"
		@remove="emit('remove')"
	/>
	<WIcon
		aria-label="Internal Link Text"
		class="flex items-start pt-1"
	>
		<IconLink/>
	</WIcon>
	<ComboboxRoot
		class="w-full flex flex-col gap-1"
		:diplay-value="(_:{ text: string }) => _?.text"
		:reset-search-term-on-select="false"
		:reset-search-term-on-blur="false"
		:default-value="linkSelected"
		v-model="linkSelected"
	>
		<ComboboxInput
			class="
				link-link-input
				flex-1
				border-b
				border-neutral-300
				dark:border-neutral-700
				focus:border-accent-500
				px-1
				focus-outline
			"
			aria-label="Internal Link"
			placeholder="Search..."
			v-model="searchTerm"
			@focus="searchTerm = ''"
			@blur="searchTerm= linkSelected?.text ?? ''"
			@keydown.enter="searchTerm= linkSelected?.text ?? ''"
			@keydown.escape="emit('close')"
		/>
		<ComboboxContent>
			<ComboboxViewport class="py-2 flex flex-col gap-1">
				<ComboboxItem
					:value="option"
					class="
					data-highlighted:bg-accent-500/50
					rounded-md
					px-1
					py-1
					cursor-pointer
				"
					v-for="(option, index) in linkSuggestions"
					:key="index"
				>
					{{ option.text }}
				</ComboboxItem>
			</ComboboxViewport>
		</ComboboxContent>
	</ComboboxRoot>
</div>
</template>

<script setup lang="ts">
import type { Mark } from "@tiptap/pm/model"
import type { Editor } from "@tiptap/vue-3"
import { ComboboxContent, ComboboxInput, ComboboxItem, ComboboxRoot, ComboboxViewport } from "reka-ui"
import { ref, watch } from "vue"

import IconText from "~icons/lucide/case-sensitive"
// https://github.com/unplugin/unplugin-vue-components/issues/633
import IconLink from "~icons/lucide/file-symlink"


const props = defineProps<{
	editor: Editor
	linkSuggestions?: { text: string, id: string }[]
	linkMark: Mark | undefined
	isChanged: boolean
	itemToHref: (item: { text: string, id: string }) => string
	hrefToItem: (href: string) => { text: string, id: string } | undefined
}>()

const emit = defineEmits<{
	close: [e?: Event]
	copy: [value: string]
	remove: []
}>()

const el = ref<HTMLElement | null>(null)
const linkHref = defineModel<string>("linkHref", { required: true })
const linkText = defineModel<string>("linkText", { required: true })
const linkSelected = ref<{ text: string, id: string } | undefined>(props.hrefToItem(linkHref.value))
const searchTerm = ref("")
if (linkSelected.value?.text) {
	linkText.value = linkSelected.value.text
	searchTerm.value = linkSelected.value.text
}


watch(linkSelected, () => {
	if (linkSelected.value?.text) {
		linkText.value = linkSelected.value.text
		searchTerm.value = linkSelected.value.text
	}
})

function saveChanges(e?: Event) {
	if (!linkSelected.value) return
	const href = props.itemToHref(linkSelected.value)
	props.editor.commands.changeOrAddLink(
		href,
		linkText.value,
		true
	)
	emit("close", e)
}

defineExpose({
	focus: (type: "text" | "link") => {
		const inputType = type === "link" ? "link-link-input" : "link-text-input"
		const input = el.value?.querySelector(`.${inputType}`)
		if (input && input instanceof HTMLInputElement) input.focus()
	}
})
</script>
