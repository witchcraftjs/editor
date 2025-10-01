<template>
<div
	class="flex flex-nowrap flex-row gap-1 items-start"
	ref="el"
>
	<div class="flex flex-col gap-1">
		<!-- @vue-expect-error -->
		<WSimpleInput
			class="text-input"
			wrapper-class="flex flex-nowrap gap-1"
			v-model="linkTextValue"
			@keydown.esc="emit('close', $event)"
			@submit="saveChanges"
		>
			<!-- @vue-expect-error -->
			<template #label="slotProps">
				<WLabel
					v-bind="slotProps"
					title="Link Text"
					aria-label="Link Text"
					class="flex items-center"
				>
					<i-ic-round-short-text class="w-[1.25em] !h-auto"/>
				</WLabel>
			</template>
		</WSimpleInput>
		<!-- @vue-expect-error -->
		<WSimpleInput
			class="link-input"
			wrapper-class="flex flex-nowrap gap-1"
			:suggestions="linkSuggestions"
			v-model="linkHref"
			@keydown.esc="emit('close', $event)"
			@submit="saveChanges"
		>
			<!-- @vue-expect-error -->
			<template #label="slotProps">
				<WLabel
					v-bind="slotProps"
					aria-label="Location"
					title="Location"
					class="flex items-center"
				>
					<i-ic-round-link class="w-[1.25em] !h-auto"/>
				</WLabel>
			</template>
		</WSimpleInput>
	</div>
	<div class="flex flex-col gap-1">
		<BubbleMenuLinkActions
			:link-mark="linkMark"
			:link-href="linkHref"
			:is-changed="isChanged"
			@save="saveChanges"
			@copy="emit('copy', $event)"
			@remove="emit('remove')"
		/>
		<div class="flex flex-nowrap flex-row gap-1 justify-start border border-transparent">
			<WButton
				v-if="linkHref"
				:border="false"
				class="text-neutral-700 dark:text-neutral-300"
				aria-label="Go to Link"
				title="Go to Link"
				@click="goToLink"
			>
				<!-- The heroicons look a bit weird next to font awesome -->
				<WIcon><i-fa-solid-external-link-alt class="w-[1.25em] !h-auto"/></WIcon>
			</WButton>
		</div>
	</div>
</div>
</template>

<script setup lang="ts">
import type { Mark } from "@tiptap/pm/model"
import type { Editor } from "@tiptap/vue-3"
import WIcon from "@witchcraft/ui/components/Icon"
import WButton from "@witchcraft/ui/components/LibButton"
import WLabel from "@witchcraft/ui/components/LibLabel"
import WSimpleInput from "@witchcraft/ui/components/LibSimpleInput"
import { ref } from "vue"

import BubbleMenuLinkActions from "./BubbleMenuLinkActions.vue"

// https://github.com/unplugin/unplugin-vue-components/issues/633
import iFaSolidExternalLinkAlt from "~icons/fa-solid/external-link-alt"
import iIcRoundLink from "~icons/ic/round-link"
import iIcRoundShortText from "~icons/ic/round-short-text"

const props = defineProps<{
	editor: Editor
	linkSuggestions?: string[]
	linkMark: Mark | undefined
	isChanged: boolean
}>()
const emit = defineEmits<{
	close: [e?: Event]
	copy: [value: string]
	remove: []
}>()
const linkHref = defineModel<string>("linkHref", { required: true })
const linkTextValue = defineModel<string>("linkTextValue", { required: true })
const el = ref<HTMLElement | null>(null)

function goToLink() {
	window.open(linkHref.value, "_blank")
}
defineExpose({
	focus: (type: "text" | "link") => {
		const inputType = type === "link" ? "link-input" : "text-input"
		const input = el.value?.querySelector(`.${inputType}`)
		if (input && input instanceof HTMLInputElement) input.focus()
	}
})
function saveChanges(e: Event | string) {
	props.editor.commands.changeOrAddLink(
		linkHref.value,
		linkTextValue.value,
		false
	)
	emit("close", e instanceof Event ? e : undefined)
}
</script>
