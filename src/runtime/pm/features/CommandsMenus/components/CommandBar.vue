<template>
<div
	class="
	rounded-sm
	border-neutral-300
	dark:border-neutral-700
	border
	bg-neutral-50
	dark:bg-neutral-950
	p-1
	flex
	[&>div]:px-1
	[&>div:last-of-type]:pr-0
	[&>div]:border-neutral-300
	[&>div]:dark:border-neutral-700
	[&>div]:border-r
	[&>div:last-of-type]:border-r-0
"
>
	<template
		v-for="item in commands"
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
			v-else-if="item.type === 'group' && item.variations.some(subItem => subItem.canShow === undefined || subItem.canShow(editor.state))"
			class="
				flex
				gap-1
			"
		>
			<CommandBarItem
				:item="subItem"
				:editor="editor"
				v-for="subItem in item.variations"
				:key="subItem.title"
			/>
		</div>
	</template>
</div>
</template>

<script setup lang="ts">
import type { Editor } from "@tiptap/core"

import CommandBarItem from "./CommandBarItem.vue"

import type { CommandBarCommand, CommandBarGroup } from "../types"

/* const props =  */defineProps<{
	editor: Editor
	commands: (CommandBarCommand | CommandBarGroup)[]
}>()
</script>
