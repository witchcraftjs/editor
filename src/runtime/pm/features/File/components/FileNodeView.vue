<template>
<NodeViewWrapper
	class="inline-block relative group"
	data-drag-handle
>
	<div
		:class="twMerge(
			`relative block overflow-hidden rounded-xs border-2 border-transparent`,
			selected && `border-accent-500`,
			resizePreview && `select-none`
		)"
		:style="{ borderWidth: '2px' }"
		@click.stop="props.editor.commands.setNodeSelection(getPos()!)"
	>
		<template v-if="!fileViewComponent">
			<img
				:src="props.node.attrs.src"
				:style="{
					width: (resizePreview?.width ?? props.node.attrs.width) !== undefined ? `${resizePreview?.width ?? props.node.attrs.width}px` : undefined,
					height: (resizePreview?.height ?? props.node.attrs.height) !== undefined ? `${resizePreview?.height ?? props.node.attrs.height}px` : undefined
				}"
				draggable="false"
				:class="twMerge(
					(resizePreview?.width ?? props.node.attrs.width) === undefined ? `max-w-full h-auto` : `h-auto`
				)"
				ref="imgRef"
			>
		</template>
		<template v-else>
			<div
				class="block"
				:style="{
					width: (resizePreview?.width ?? props.node.attrs.width) !== undefined ? `${resizePreview?.width ?? props.node.attrs.width}px` : undefined,
					height: (resizePreview?.height ?? props.node.attrs.height) !== undefined ? `${resizePreview?.height ?? props.node.attrs.height}px` : undefined
				}"
				ref="fileViewRef"
			>
				<component
					:id="props.node.attrs.id"
					:src="props.node.attrs.src"
					:width="resizePreview?.width ?? props.node.attrs.width"
					:height="resizePreview?.height ?? props.node.attrs.height"
					:ignore-aspect-on-resize="props.node.attrs.ignoreAspectOnResize"
					:is="fileViewComponent"
				/>
			</div>
		</template>


		<WButton
			class="
				absolute
				top-1
				right-1
				flex
				justify-center
				items-center
				aspect-square
				rounded-sm
				bg-neutral-100
				dark:bg-neutral-700
				p-1
				opacity-0
				group-hover:opacity-100
				transition-opacity
			"
			contenteditable="false"
			:aria-label="'Reset to Original Size or Fit'"
			:border="false"
			@click="resetImageSize();editor.commands.focus()"
		>
			<WIcon
				class="leading-none"
			>
				<IconImageReset/>
			</WIcon>
		</WButton>
	</div>

	<div
		class="
			absolute
			inset-y-0
			left-0
			w-3
			cursor-col-resize
			z-50
			flex
			items-center
			justify-center
			opacity-0
			pointer-events-none
			group-hover:opacity-100
			group-hover:pointer-events-auto
		"
		@pointerdown="startResize('left')($event)"
	>
		<div class="w-0.5 h-5 rounded-full bg-accent-500"/>
	</div>

	<div
		class="
			absolute
			inset-y-0
			right-0
			w-3
			cursor-col-resize
			z-50
			flex
			items-center
			justify-center
			opacity-0
			pointer-events-none
			group-hover:opacity-100
			group-hover:pointer-events-auto
		"
		@pointerdown="startResize('right')($event)"
	>
		<div class="w-0.5 h-5 rounded-full bg-accent-500"/>
	</div>
</NodeViewWrapper>
</template>

<script setup lang="ts">
import { nodeViewProps, NodeViewWrapper } from "@tiptap/vue-3"
import WButton from "@witchcraft/ui/components/WButton"
import WIcon from "@witchcraft/ui/components/WIcon"
import { twMerge } from "tailwind-merge"
import { inject, ref } from "vue"

import IconImageReset from "~icons/lucide/rotate-ccw"

import { fileViewInjectionKey } from "../types.js"

const props = defineProps(nodeViewProps)

const fileViewComponent = inject(fileViewInjectionKey, undefined)
const imgRef = ref<HTMLImageElement | undefined>(undefined)
const fileViewRef = ref<HTMLElement | undefined>(undefined)

let state: {
	aspectRatio: number
	clientX: number
	startWidth: number
	handleSide: "left" | "right"
	controller: AbortController | undefined
} | undefined

const resizePreview = ref<{ width: number, height?: number } | undefined>(undefined)

function resetImageSize(): void {
	props.updateAttributes({ width: undefined, height: undefined })
}

function handlePointerMove(e: PointerEvent): void {
	e.preventDefault()
	if (!state) return

	const delta = state.handleSide === "right"
		? e.clientX - state.clientX
		: state.clientX - e.clientX

	const newWidth = Math.max(50, state.startWidth + delta)
	resizePreview.value = props.node.attrs.ignoreAspectOnResize
		? { width: newWidth, height: undefined }
		: { width: newWidth, height: newWidth / state.aspectRatio }
}

function handlePointerUp(): void {
	if (!state) return

	state.controller?.abort()

	if (resizePreview.value) {
		props.updateAttributes({
			width: resizePreview.value.width,
			height: resizePreview.value.height
		})
	}
	state = undefined
	resizePreview.value = undefined
}

function startResize(handleSide: "left" | "right"): (e: PointerEvent) => void {
	return e => {
		e.preventDefault()
		e.stopPropagation()

		const target = fileViewComponent ? fileViewRef.value : imgRef.value
		if (!target) return

		const aspectRatio = "naturalHeight" in target
			? ((target as HTMLImageElement).naturalHeight > 0 ? (target as HTMLImageElement).naturalWidth / (target as HTMLImageElement).naturalHeight : 1)
			: (target.offsetHeight > 0 ? target.offsetWidth / target.offsetHeight : 1)


		state = {
			aspectRatio,
			clientX: e.clientX,
			startWidth: target.offsetWidth,
			handleSide,
			controller: new AbortController()
		}

		document.addEventListener("pointermove", handlePointerMove, { signal: state.controller!.signal })
		document.addEventListener("pointerup", handlePointerUp, { signal: state.controller!.signal })
	}
}
</script>

