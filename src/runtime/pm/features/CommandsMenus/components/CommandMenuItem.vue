<template>
<div
	:title="item.type === 'command' ? item.description :undefined"
>
	<div
		class="
		group/menu-item
		rounded-xs
		hover:text-accent-700
		dark:hover:text-accent-400
		cursor-pointer
		gap-x-1
		grid
		[grid-template-columns:min-content_1fr_min-content]
		items-center
	"
		@click="handleClick"
	>
		<WIcon class="w-[1em] text-center">
			<component
				v-if="item.icon"
				:is="'component' in item.icon ? item.icon.component : item.icon"
				v-bind="'props' in item.icon ?{ editor, ...item.icon.props } : { editor }"
			/>
		</WIcon>
		<div> {{ item.title }} </div>
		<IconChevronRight
			v-if="item.type === 'group'"
			class="
				text-neutral-500
				pl-2
				group-hover/menu-item:text-accent-500
			"
		/>
		<div v-else/>
	</div>
</div>
</template>

<script setup lang="ts">
import { inject } from "vue"

import IconChevronRight from "~icons/lucide/chevron-right"

import type { ItemMenuCommand } from "../../Blocks/types.js"
import { commandExecuterInjectionKey, type CommandGroup, menuEditorInjectionKey } from "../types.js"

const editor = inject(menuEditorInjectionKey)

const props = defineProps<{
	item: ItemMenuCommand | CommandGroup
}>()
const emit = defineEmits<{
	(e: "close"): void
}>()

const executer = inject(commandExecuterInjectionKey)
if (!executer) {
	throw new Error("Command executer must be provided.")
}

function handleClick() {
	if (props.item.type === "command") {
		executer!(props.item, editor!.value!)
		emit("close")
	}
}
</script>
