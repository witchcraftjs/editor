<template>
<div
	:class="twMerge(`
flex
gap-2
flex-wrap
p-2
	`)"
>
	<div
		:class="twMerge(`
			pb-2
			flex
			flex-wrap
			gap-2
		`,

			command.buttons.length >1 && `
			border
			border-neutral-300
			rounded
			w-full
			p-2
			`
		)"
		v-for="command of commands"
		:key="command.key"
	>
		<div v-if="command.buttons.length > 1">{{ command.key }}</div>
		<button
			class="
				px-2
				border
				border-neutral-600
				rounded
				bg-neutral-200
				"
			type="button"
			v-for="args in command.buttons"
			:key="command.key as string + pretty(args)"
			@mousedown="$event.preventDefault();$event.stopPropagation(); editor.chain().focus()[command.key](...args).run()"
		>
			{{ command.buttons.length === 1 ? command.key : '' }}
			{{ args.map(_ => pretty(_)).join(' ' ) }}
		</button>
	</div>
</div>
</template>
<script lang="ts" setup>
import { pretty } from "@alanscodelog/utils"
import type { Command, Editor } from "@tiptap/vue-3"
import type { EditorView } from "prosemirror-view"
import type { CoreCommands } from "src/types.js"
import { twMerge } from "tailwind-merge"
import type { PropType, ShallowRef } from "vue"


defineProps({
	editor: { type: Object as PropType<Editor>, required: true },
	commands: { type: Object as PropType<{ key: keyof CoreCommands, buttons: any[][] }[]>, required: true },
})

</script>
