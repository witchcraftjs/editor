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

			(command.buttons?.length ?? 0) >1 && `
			border
			border-neutral-500
			rounded-sm
			w-full
			p-2
			`
		)"
		v-for="command of commands"
		:key="command.key"
	>
		<div v-if="(command?.buttons?.[0]?.length ?? 0) >= 1">
			{{ command.key }}
		</div>
		<WButton
			v-for="args in command.buttons"
			:key="command.key as string + pretty(args)"
			@pointerdown="handlePointerDown($event, command, args)"
		>
			{{ (command?.buttons?.[0]?.length ?? 0) >= 1 ? '': command.key }}
			{{ args.map(_ => pretty(_ as any)).join(' ') }}
		</WButton>
	</div>
</div>
</template>

<script lang="ts" setup>
import { pretty } from "@alanscodelog/utils"
import type { Editor, SingleCommands } from "@tiptap/core"
import WButton from "@witchcraft/ui/components/LibButton"
import { twMerge } from "tailwind-merge"

const props = defineProps<{
	editor: Editor
	commands: { key: keyof SingleCommands, buttons?: any[][] }[]
}>()

function handlePointerDown(
	$event: MouseEvent,
	command: { key: keyof SingleCommands, buttons?: any[][] },
	args: any[]
) {
	$event.preventDefault()
	$event.stopPropagation()
	const commandFunc = (props.editor.chain().focus()[command.key] as any)(...args)
	if (typeof commandFunc === "object") {
		commandFunc.run()
	}
}
</script>
