<template>
<div
	class="flex items-center gap-2"
>
	<template
		v-for="item, i in filteredCommands"
		:key="item.title"
	>
		<div
			v-if="item.type === 'command'"
		>
			<CommandBarItem
				v-if="item.canShow === undefined || item.canShow(editor.state)"
				:editor="editor"
				:item="item"
			/>
			<!-- @close="emit('close')" -->
		</div>
		<div
			v-else-if="item.type === 'group'"
			class="
				flex
				gap-2
			"
		>
			<CommandBarItem
				:item="subItem"
				:editor="editor"
				v-for="subItem in item.variations"
				:key="subItem.title"
			/>
		</div>
		<div
			v-if="i !== filteredCommands.length - 1"
			class="w-[2px] h-[1rem] bg-neutral-300 dark:bg-neutral-700"
		/>
	</template>
</div>
</template>

<script setup lang="ts">
import type { Editor } from "@tiptap/core"
import { computed } from "vue"

import CommandBarItem from "./CommandBarItem.vue"

import type { CommandBarCommand, CommandBarGroup } from "../types"

const props = defineProps<{
	editor: Editor
	commands: (CommandBarCommand | CommandBarGroup)[]
}>()

const filteredCommands = computed(() => {
	return props.commands.filter(item => {
		if (item.type === "group") {
			return item.variations.some(subItem => subItem.canShow === undefined || subItem.canShow(props.editor.state))
		}
		return true
	})
})
</script>
