<template>
<node-view-wrapper
	:class="twMerge(`
		frame-wrapper
		group/embed
		relative
		max-w-[var(--pmMaxEmbedWidth)]
		max-h-[var(--pmMaxEmbedHeight,_var(--pmMaxEmbedWidth))]
	`)"
	:style="`aspect-ratio: ${node.attrs.aspectRatio}`"
>
	<div
		contenteditable="false"
		class="
			absolute
			top-1
			right-1
			rounded-sm
			bg-neutral-400/70
			border-neutral-200
			dark:bg-neutral-700/70
			dark:border-neutral-700
			p-1
			flex
			gap-1
			opacity-0
			group-hover/embed:opacity-100
			transition-opacity
		"
	>
		<WButton
			:border="false"
			@click="deleteNode();editor.commands.focus()"
		>
			<WIcon><IconTrash/></WIcon>
		</WButton>
		<WButton
			:border="false"
			@click="copy(node.attrs.src)"
		>
			<WIcon><IconCopy/></WIcon>
		</WButton>
		<WButton
			:border="false"
			@click="openLink"
		>
			<WIcon><IconExternalLink class="w-[1.25em]"/></WIcon>
		</WButton>
	</div>
	<node-view-content
		as="iframe"
		:class="twMerge(`
		w-full
		`,
			node.attrs.class
		)"
		:style="`aspect-ratio: ${node.attrs.aspectRatio}`"
		v-bind="node.attrs"
	/>
</node-view-wrapper>
</template>

<script setup lang="ts">
import { NodeViewContent, nodeViewProps, NodeViewWrapper } from "@tiptap/vue-3"
import WButton from "@witchcraft/ui/components/WButton"
import WIcon from "@witchcraft/ui/components/WIcon"
import { copy } from "@witchcraft/ui/helpers/copy"
import { twMerge } from "tailwind-merge"

import IconCopy from "~icons/lucide/copy"
import IconExternalLink from "~icons/lucide/external-link"
import IconTrash from "~icons/lucide/trash"

const props = defineProps(nodeViewProps)

function openLink() {
	props.editor.commands.openExternalLink(props.node.attrs.src)
}
</script>
