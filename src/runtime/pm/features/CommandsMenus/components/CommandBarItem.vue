<template>
<!-- pointerdown.prevent to prevent close from blurring the editor (in the plugin) -->
<div
	class="
		group/menu-item
		px-1
		rounded-xs
		hover:text-accent-700
		dark:hover:text-accent-300
		cursor-pointer
	"
	:title="item.type === 'command' ? item.description :item.title"
	@pointerdown.prevent
	@click="handleClick"
>
	<WIcon class="min-w-[1rem] text-center flex items-center justify-center h-full">
		<component
			v-if="item.icon"
			:is=" 'component' in item.icon ? item.icon.component : item.icon"
			v-bind="'props' in item.icon ? { editor, ...item.icon.props } : { editor }"
		/>
	</WIcon>
</div>
</template>

<script setup lang="ts">
import type { Editor } from "@tiptap/core"
import { inject } from "vue"

import { type CommandBarCommand, commandExecuterInjectionKey } from "../types.js"
import { defaultCommandExecuter } from "../utils/defaultCommandExecutor"

const props = defineProps<{
	item: CommandBarCommand
	editor: Editor
}>()
const emit = defineEmits<{
	(e: "close"): void
}>()
const executer = inject(commandExecuterInjectionKey, defaultCommandExecuter)
function handleClick() {
	if (props.item.type === "command") {
		executer!(props.item, props.editor)
		emit("close")
	}
}
</script>
, commadExecuterInjectionKey
