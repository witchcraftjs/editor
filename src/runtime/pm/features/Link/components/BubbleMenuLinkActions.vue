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
			<i-fa-solid-check class="w-[1.25em]"/>
		</WIcon>
		<WIcon v-else>
			<i-fa-solid-plus/>
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
		<WIcon><i-fa-solid-copy class="w-[1.25em]"/></WIcon>
	</WButton>
	<WButton
		v-if="linkMark"
		:border="false"
		class="text-neutral-700 dark:text-neutral-300"
		aria-label="Remove Link"
		title="Remove Link"
		@click="emit('remove')"
	>
		<WIcon><i-fa-solid-trash class="w-[1.25em]"/></WIcon>
	</WButton>
</div>
</template>

<script setup lang="ts">
import type { Mark } from "@tiptap/pm/model"
import WIcon from "@witchcraft/ui/components/Icon"
import WButton from "@witchcraft/ui/components/LibButton"

import IFaSolidCheck from "~icons/fa-solid/check"
import IFaSolidCopy from "~icons/fa-solid/copy"
import IFaSolidPlus from "~icons/fa-solid/plus"
import IFaSolidTrash from "~icons/fa-solid/trash"

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
