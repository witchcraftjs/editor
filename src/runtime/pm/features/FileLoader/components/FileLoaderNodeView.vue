<template>
<!-- @vue-expect-error contenteditable exists -->
<node-view-wrapper
	:class="twMerge(`
		group/file-loader
		rounded-sm
		animate-pulse
		bg-accent-200
		text-accent-800
		dark:bg-accent-700
		dark:text-accent-300
		px-2
		flex
		flex-col
		items-center
		gap-2
	`
	)"
	contenteditable="false"
>
	<div class="self-start">
		{{ `Loading "${node.attrs.fileName ?? `Unknown`}" ...` }}
	</div>
	<img
		v-if="node.attrs.preview"
		class="!max-h-[200px] !max-w-[200px] mb-2"
		:src="node.attrs.preview"
		alt="Loading Image"
	>
</node-view-wrapper>
</template>

<script setup lang="ts">
import { nodeViewProps, NodeViewWrapper } from "@tiptap/vue-3"
import { twMerge } from "tailwind-merge"

/* const props =  */defineProps(nodeViewProps)
</script>
