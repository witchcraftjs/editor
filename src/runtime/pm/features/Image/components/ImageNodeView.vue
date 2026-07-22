<script setup lang="ts">
import { ResizableNodeView } from "@tiptap/core"
import { nodeViewProps, NodeViewWrapper } from "@tiptap/vue-3"
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue"

import IconMaximize2 from "~icons/lucide/maximize-2"
import IconMinimize2 from "~icons/lucide/minimize-2"

const props = defineProps(nodeViewProps)

const wrapperRef = ref<HTMLDivElement | null>(null)
let resizableInstance: any = null

function toggleMaxWidth(): void {
	const currentWidth = props.node.attrs.width
	if (currentWidth != null) {
		props.updateAttributes({ width: null, height: null })
	} else {
		const img = wrapperRef.value?.querySelector("img")
		if (img && img.naturalWidth > 0) {
			props.updateAttributes({ width: img.naturalWidth, height: img.naturalHeight })
		}
	}
}

async function initResizable(): Promise<void> {
	await nextTick()
	if (wrapperRef.value == null) {
		return
	}

	const img = wrapperRef.value.querySelector("img")
	if (img == null) {
		return
	}

	resizableInstance = new ResizableNodeView({
		element: img,
		node: props.node.toJSON(),
		getPos: () => props.getPos(),
		onResize(width: number, height: number): void {
			img.style.width = `${width}px`
			img.style.height = `${height}px`
		},
		onCommit(width: number, height: number): void {
			props.editor.commands.updateAttributes("image", { width: Math.round(width), height: Math.round(height) })
		},
		onUpdate(updatedNode: any): boolean {
			if (updatedNode.type !== props.node.type) {
				return false
			}
			return true
		},
		options: {
			directions: ["left", "right"],
			min: { width: 50 },
			preserveAspectRatio: true,
			className: {
				container: "image-resize-container",
				handle: "image-resize-handle",
				resizing: "image-is-resizing"
			}
		}
	})
}

onMounted(async () => {
	if (typeof window === "undefined" || !window.document) {
		return
	}
	try {
		await initResizable()
	} catch {
		// ResizableNodeView may not work in all environments (e.g., JSDOM)
	}
})

onUnmounted(() => {
	if (resizableInstance) {
		resizableInstance.destroy?.()
		resizableInstance = null
	}
})

watch(() => props.node.attrs.width, async () => {
	await nextTick()
	const img = wrapperRef.value?.querySelector("img")
	if (img == null) {
		return
	}
	const w = props.node.attrs.width
	if (w != null) {
		img.style.width = `${w}px`
		img.style.height = props.node.attrs.height != null ? `${props.node.attrs.height}px` : "auto"
	} else {
		img.style.width = ""
		img.style.height = ""
	}
})
</script>

<template>
<NodeViewWrapper
	:class="{
		'image-wrapper': true,
		'image-wrapper--selected': selected
	}"
	v-bind="{
		...props.node.attrs,
		width: undefined,
		height: undefined
	}"
>
	<div
		class="relative inline-block"
		contenteditable="false"
		ref="wrapperRef"
	>
		<img
			:src="props.node.attrs.src"
			:class="[
				props.node.attrs.width == null ? 'max-w-full h-auto' : 'h-auto'
			]"
		>
	</div>

	<div
		v-if="selected && props.editor.isEditable"
		class="absolute top-0 right-0 flex gap-1 bg-neutral-900 dark:bg-neutral-100 rounded-sm p-1 -translate-y-full translate-x-1/2 -mt-2 z-10"
		contenteditable="false"
	>
		<button
			class="p-1 rounded text-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-300"
			:title="props.node.attrs.width == null ? 'Set to original size' : 'Reset to max width'"
			@click="toggleMaxWidth"
		>
			<component
				class="w-4 h-4"
				:is="props.node.attrs.width == null ? IconMinimize2 : IconMaximize2"
			/>
		</button>
	</div>
</NodeViewWrapper>
</template>

<style scoped>
.image-wrapper {
	display: inline-block;
	position: relative;
}

.image-wrapper--selected::after {
	content: '';
	position: absolute;
	inset: 0;
	border: 1px solid rgb(115 115 115 / 0.5);
	border-radius: 4px;
	pointer-events: none;
}

.image-wrapper--selected:focus-within::after {
	border-color: rgb(240 145 23 / 0.8);
}
</style>
