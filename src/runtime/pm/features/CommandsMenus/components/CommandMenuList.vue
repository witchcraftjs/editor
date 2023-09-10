<template>
<div
	class="
	commands-list
	flex
	flex-col
	rounded-sm
	border
	bg-neutral-100
	border-neutral-300
	dark:bg-neutral-800
	dark:border-neutral-700
	m-1
	[&>*:first-child]:border-t-0
	[&>*:first-child]:rounded-t-sm
	[&>*:last-child]:rounded-b-sm
"
>
	<template
		v-for="item in entries"
		:key="item.type + item.title"
	>
		<div

			class="
			border-t
			border-neutral-300
		"
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
				@close="emit('close')"
			/>
		</div>
	</template>
</div>
</template>

<script setup lang="ts">
import CommandMenuGroup from "./CommandMenuGroup.vue"
import CommandMenuItem from "./CommandMenuItem.vue"

import type { ItemMenuCommand } from "../../Blocks/types"
import type { CommandGroup } from "../types.js"

/* const props =  */defineProps<{
	entries: (ItemMenuCommand | CommandGroup)[]
}>()
const emit = defineEmits<{
	(e: "close"): void
}>()
</script>
