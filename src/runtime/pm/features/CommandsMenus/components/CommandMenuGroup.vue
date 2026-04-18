<template>
<div
	class="
		group/command-group
	"
	@mouseenter="isOpen = true"
>
	<WPopover
		:model-value="isOpen"
		:content-props="{
			collisionBoundary,
			side: 'right',
			align: 'start',
			class: `
				bg-neutral-100
				dark:bg-neutral-700
				text-sm
				z-10
			`
		}"
		:show-arrow="false"
		:use-backdrop="false"
		:animation-direction="'show'"
		@update:model-value="isOpen = $event"
	>
		<template #button>
			<CommandMenuItem
				:item="item"
				:class="`pr-2 -mr-2`"
				v-extract-root-el="(_: any) => el = _"
			/>
		</template>
		<template #popover>
			<div
				@mouseleave="isOpen = false"
			>
				<CommandMenuList
					:editor="editor"
					:entries="item.variations"
					class="ml-0 mt-0"
					@close="emit('close')"
				/>
			</div>
		</template>
	</WPopover>
</div>
</template>

<script setup lang="ts">
import type { Editor } from "@tiptap/core"
import WPopover from "@witchcraft/ui/components/WPopover"
import { vExtractRootEl } from "@witchcraft/ui/directives/vExtractRootEl"
import { ref, watch } from "vue"

import CommandMenuItem from "./CommandMenuItem.vue"
import CommandMenuList from "./CommandMenuList.vue"

import type { CommandGroup } from "../types.js"

const props = defineProps<{
	editor: Editor
	item: CommandGroup
}>()

const collisionBoundary = ref<HTMLElement | null>(null)
const el = ref<HTMLDivElement | null>(null)
const isOpen = defineModel<boolean>("isOpen", { default: false })

const emit = defineEmits<{
	(e: "close"): void
}>()


watch(() => props.editor, newVal => {
	collisionBoundary.value = newVal.view.dom.parentElement
})
</script>
