<template>
<div
	:class="twMerge(
		`flex flex-col`,
		isOpen && `gap-1`
	)"
	ref="el"
>
	<div class="flex flex-nowrap flex-row gap-1 items-center">
		<WLabel
			id="menu-link-input"
			title="Internal Link"
			aria-label="Internal Link"
			class="flex items-center"
		>
			<i-ic-round-link class="w-[1.25em] !h-auto"/>
		</WLabel>
		<!-- @vue-expect-error -->
		<WSimpleInput
			id="menu-link-input"
			class="link-input"
			:suggestions="linkSuggestions"
			v-model="inputValue"
			@submit="submitHandler"
			@keydown="keydownHandler"
			@blur="blurHandler"
			@focus="canOpen = true"
		/>
		<BubbleMenuLinkActions
			:link-mark="linkMark"
			:is-changed="isChanged"
			@save="saveChanges"
			@copy="emit('copy', $event)"
			@remove="emit('remove')"
		/>
	</div>
	<WSuggestions
		:suggestions="linkSuggestions"
		:can-open="canOpen"
		class="flex-1 rounded-sm overflow-hidden"
		ref="suggestionsComponent"
		v-model="linkText"
		v-model:input-value="inputValue"
		v-model:open="isOpen"
		@submit="submitHandler"
	/>
</div>
</template>

<script setup lang="ts">
import type { Mark } from "@tiptap/pm/model"
import type { Editor } from "@tiptap/vue-3"
import WLabel from "@witchcraft/ui/components/LibLabel"
import WSimpleInput from "@witchcraft/ui/components/LibSimpleInput"
import WSuggestions from "@witchcraft/ui/components/LibSuggestions"
import { twMerge } from "@witchcraft/ui/utils/twMerge"
import { ref, watch } from "vue"
// https://github.com/vuejs/language-tools/issues/3206#issuecomment-1563399071
import type { ComponentExposed } from "vue-component-type-helpers"

import BubbleMenuLinkActions from "./BubbleMenuLinkActions.vue"

// https://github.com/unplugin/unplugin-vue-components/issues/633
import iIcRoundLink from "~icons/ic/round-link"

const props = defineProps<{
	editor: Editor
	linkSuggestions?: string[]
	linkMark: Mark | undefined
	isChanged: boolean
	getInternalLinkHref: (href: string) => string
}>()
const emit = defineEmits<{
	close: [e?: Event]
	copy: [value: string]
	remove: []
}>()

const linkText = defineModel<string>("linkText", { required: true })
const inputValue = defineModel<string>("tempLinkTextValue", { default: "" })
const canOpen = ref(false)
const isOpen = ref(false)
const el = ref<HTMLElement | null>(null)
const suggestionsComponent = ref<ComponentExposed<typeof WSuggestions>>()

watch(linkText, () => {
	inputValue.value = linkText.value
}, { immediate: true })

// function goToLink() {
// 	window.open(linkText.value, "_blank")
// }

function keydownHandler(e: KeyboardEvent) {
	if (e.key === "Escape") {
		emit("close", e)
	}

	(suggestionsComponent.value as any)?.inputKeydownHandler?.(e)
}
function saveChanges(e?: Event) {
	const href = props.getInternalLinkHref(inputValue.value)
	props.editor.commands.changeOrAddLink(
		href,
		inputValue.value,
		true
	)
	emit("close", e)
}

function blurHandler(e: FocusEvent) {
	(suggestionsComponent.value as any)?.inputBlurHandler?.(e)
}
// make the user hit enter once to select, then enter again to submit and close
function submitHandler(): void {
	if (linkText.value === inputValue.value) {
		saveChanges()
	}
}

defineExpose({
	focus: () => {
		const input = el.value?.querySelector(`input`)
		if (input) input.focus()
	}
})
</script>
