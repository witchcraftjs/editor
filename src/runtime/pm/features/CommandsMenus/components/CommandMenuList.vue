<template>
<div
	class="commands-list flex flex-col rounded-sm gap-1"
>
	<template
		v-for="item, i in entries"
		:key="item.type + item.title"
	>
		<div v-if="item.type === 'command'">
			<CommandMenuItem
				:item="item"
				@close="emit('close')"
			/>
		</div>

		<CommandMenuGroup
			v-else-if="item.type === 'group'"
			:item="item"
			:editor="editor"
			:is-open="shownMenu === item.title"
			@update:is-open="shownMenu = item.title"
			@close="emit('close')"
		/>
		<div
			v-if="i !== entries.length - 1"
			class="
				w-full
				h-px
				bg-neutral-300
				dark:bg-neutral-700
			"
		/>
	</template>
</div>
</template>

<script setup lang="ts">
import type { Editor } from "@tiptap/core"
import { onUnmounted, ref } from "vue"

import CommandMenuGroup from "./CommandMenuGroup.vue"
import CommandMenuItem from "./CommandMenuItem.vue"

import type { ItemMenuCommand } from "../../Blocks/types"
import type { CommandGroup } from "../types.js"

/* const props =  */defineProps<{
	entries: (ItemMenuCommand | CommandGroup)[]
	editor: Editor
}>()

const shownMenu = ref<string | undefined>(undefined)
const emit = defineEmits<{
	(e: "close"): void
}>()


onUnmounted(() => {
	shownMenu.value = undefined
})
</script>
