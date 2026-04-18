<template>
<div class="flex flex-nowrap flex-row gap-1 border border-transparent">
	<WButton
		:border="false"
		:disabled="!isChanged"
		class="text-ok-700 dark:text-ok-300"
		:aria-label="linkMark ? 'Save' : 'Add'"
		:title="linkMark ? 'Save' : 'Add'"
		@click="emit('save', $event)"
	>
		<WIcon v-if="linkMark">
			<IconCheck class="scale-120"/>
		</WIcon>
		<WIcon v-else>
			<IconPlus/>
		</WIcon>
	</WButton>
	<WButton
		v-if="linkHref"
		:border="false"
		class="text-neutral-700 dark:text-neutral-300"
		aria-label="Copy"
		title="Copy"
		@click="emit('copy', linkHref)"
	>
		<WIcon><IconCopy class=""/></WIcon>
	</WButton>
	<WButton
		v-if="linkMark"
		:border="false"
		class="text-neutral-700 dark:text-neutral-300"
		aria-label="Remove Link"
		title="Remove Link"
		@click="emit('remove')"
	>
		<WIcon><IconTrash class=""/></WIcon>
	</WButton>
</div>
</template>

<script setup lang="ts">
import type { Mark } from "@tiptap/pm/model"
import WButton from "@witchcraft/ui/components/WButton"
import WIcon from "@witchcraft/ui/components/WIcon"

import IconCheck from "~icons/lucide/check"
import IconCopy from "~icons/lucide/copy"
import IconPlus from "~icons/lucide/plus"
import IconTrash from "~icons/lucide/trash"

defineProps<{
	linkMark: Mark | undefined
	linkHref?: string
	isChanged: boolean
}>()
const emit = defineEmits<{
	close: [e: Event]
	copy: [value: string]
	save: [e: Event]
	remove: []
}>()
</script>
