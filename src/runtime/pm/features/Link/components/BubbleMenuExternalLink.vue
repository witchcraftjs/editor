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
		aria-label="External Link Text"
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
		aria-label="External Link Text"
		class="flex items-start pt-1"
	>
		<IconLink/>
	</WIcon>
	<WSimpleInput
		aria-label="Link Location"
		:border="false"
		class="
				link-link-input
				border-b
				border-neutral-300
				dark:border-neutral-700
				focus:border-accent-500
				rounded-none
				after:rounded-none
			"
		v-model="linkHref"
		@keydown.esc="emit('close', $event)"
		@submit="saveChanges"
	/>

	<WButton
		v-if="linkHref"
		:border="false"
		class="text-neutral-700 dark:text-neutral-300"
		aria-label="Go to Link"
		title="Go to Link"
		@click="goToLink"
	>
		<WIcon><IconLinkExternal class=""/></WIcon>
	</WButton>
</div>
</template>


<script setup lang="ts">
import type { Mark } from "@tiptap/pm/model"
import type { Editor } from "@tiptap/vue-3"
import WButton from "@witchcraft/ui/components/WButton"
import WIcon from "@witchcraft/ui/components/WIcon"
import WSimpleInput from "@witchcraft/ui/components/WSimpleInput"
import { ref } from "vue"

import BubbleMenuLinkActions from "./BubbleMenuLinkActions.vue"

import IconText from "~icons/lucide/case-sensitive"
// https://github.com/unplugin/unplugin-vue-components/issues/633
import IconLinkExternal from "~icons/lucide/external-link"
import IconLink from "~icons/lucide/link"

const props = defineProps<{
	editor: Editor
	linkMark: Mark | undefined
	isChanged: boolean
}>()
const emit = defineEmits<{
	close: [e?: Event]
	copy: [value: string]
	remove: []
}>()
const linkHref = defineModel<string>("linkHref", { required: true })
const linkText = defineModel<string>("linkText", { required: true })
const el = ref<HTMLElement | null>(null)


function goToLink() {
	window.open(linkHref.value, "_blank")
}
defineExpose({
	focus: (type: "text" | "link") => {
		const inputType = type === "link" ? "link-link-input" : "link-text-input"
		const input = el.value?.querySelector(`.${inputType}`)
		if (input && input instanceof HTMLInputElement) input.focus()
	}
})
function saveChanges(e: Event | string) {
	props.editor.commands.changeOrAddLink(
		linkHref.value,
		linkText.value,
		false
	)
	emit("close", e instanceof Event ? e : undefined)
}
</script>
