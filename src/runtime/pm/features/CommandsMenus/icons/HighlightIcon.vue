<template>
<div
	class=" flex justify-center items-center"
>
	<div
		v-if="colorSlot !== undefined"
		class=" w-[1rem] h-[1rem] rounded-full text-sm overflow-hidden"
		:style="`background-color: ${color?.color}`"
		:title="color?.name"
	>
		<FaSolidHighlighter class="mb-2 ml-1"/>
	</div>
	<div
		v-else
		class="
		w-[1rem]
		h-[1rem]
		rounded-full
		bg-neutral-100
		dark:bg-neutral-900
		border-2
		border-dashed
		border-neutral-500
		flex justify-center items-center
	"
	/>
</div>
</template>

<script setup lang="ts">
import type { Editor } from "@tiptap/core"
import { computed } from "vue"

import FaSolidHighlighter from "~icons/lucide/highlighter"

import type { HighlightMarkOptions } from "../../Highlight/types.js"
import { highlightPluginKey } from "../../Highlight/types.js"

const props = defineProps<{
	editor: Editor
	colorSlot?: keyof HighlightMarkOptions["colors"] | string // why does vue think the former is an object???
}>()

const color = computed(() => {
	const colors = highlightPluginKey.getState(props.editor.state)?.colors
	if (colors && props.colorSlot !== undefined) {
		return colors[props.colorSlot as keyof HighlightMarkOptions["colors"]]
	}
	return undefined
})
</script>
