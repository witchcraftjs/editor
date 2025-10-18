<template>
<!-- todo move to ui library -->

<div
	contenteditable="false"
	:class="twMerge(`group/handles
		absolute
		left-0
		w-[calc(var(--dragHandleSize)+var(--dragHandleMargin))]
		h-full
	`,
		passedDragThreshold &&`
		hidden
	`
	)"
>
	<div
		:class="twMerge(`grab-handle
			absolute
			left-0
			w-[calc(var(--dragHandleSize)+var(--dragHandleMargin))]
			flex justify-center
			bg-gradient-to-br
			from-neutral-50
			to-neutral-100
			dark:from-neutral-800
			dark:to-neutral-900
			rounded-sm
			py-1
			h-full
			transition-opacity
			duration-[450ms]

			before:w-[var(--dragHandleSize)]
			before:bg-neutral-300
			dark:before:bg-neutral-700
			before:[mask-image:var(--dragHandleImage)]
			before:[mask-repeat:space]
			before:[mask-size:calc(var(--dragHandleSize)/2.1)]
			before:[mask-position:center]
			opacity-0
			group-hover/handles:cursor-pointer
			group-hover/handles:opacity-100
			group-[.using-touch]:hidden
		`,
			($attrs as any)?.class
		)"
		ref="grabHandle"
		@pointerdown="emit('grabHandlePointerDown', $event)"
		@contextmenu.prevent="emit('grabHandleContextMenu', $event)"
	/>
	<div
		:class="twMerge(`collapse-indicator
			hover:cursor-pointer
			absolute
			flex items-center justify-center
			h-full
			w-[calc(var(--dragHandleSize)+var(--dragHandleMargin))]
			group-[.using-touch]:hidden
		`,
			hasChildren && `
			after:transition-all
			after:opacity-0
			group-hover/handles:after:opacity-100
			group-hover/handles:after:bg-neutral-500
			group/handles:after:hover:opacity-100
			group-hover/handles:hover:after:bg-accent-500

			after:h-[var(--dragHandleSize)]
			after:w-[var(--dragHandleSize)]
			after:bg-neutral-300
			dark:after:bg-neutral-700

			after:absolute
			after:[mask-image:var(--dragHandleCollapseIndicatorImage)]
			after:[mask-size:contain]
			after:[mask-position:left]
			after:[mask-repeat:no-repeat]
		`,
			hasChildren && !hideChildren && `
			after:rotate-90
			after:translate-y-[50%]
		`,
			hasChildren && hideChildren && `
			after:left-0
			group-[.using-touch]:block
		`,

			!hasChildren && `
			hidden
			group-[.using-touch]:hidden
		`
		)"
		@click="emit('collapseIndicatorClick', $event)"
		@contextmenu.prevent="emit('grabHandleContextMenu', $event)"
	/>
</div>
</template>

<script lang="ts">
/**
 * 	Multipurpose drag handle + collapse indicator.
 *
 * 	This is incredibly useful for making a compact draggable tree view.
 *
 * 	The collapse indicator has a default height, but it should be set manually. For example `[&>.collapse-indicator]:h-[...]`
 *
 * 	The component only emits a few events, it does not handle the dragging itself or what actually happens on any clicks/input.
 */
export default { }
</script>

<script setup lang="ts">
import { twMerge } from "@witchcraft/ui/utils/twMerge"
import { onMounted, onUnmounted, ref, useAttrs } from "vue"


defineOptions({
	name: "DragTreeHandle"
})
interface Props {
	hasChildren: boolean
	passedDragThreshold: boolean
	hideChildren: boolean
}

const $attrs = useAttrs()
defineProps<Props>()
const emit = defineEmits<{
	(e: "collapseIndicatorClick", event: MouseEvent): void
	(e: "grabHandlePassiveTouchStart", event: TouchEvent): void
	(e: "grabHandlePointerDown", event: PointerEvent): void
	(e: "grabHandleContextMenu", event: PointerEvent): void
}>()
const grabHandle = ref<HTMLElement | null>(null)

function touchStart(e: TouchEvent): void {
	emit("grabHandlePassiveTouchStart", e)
}

onMounted(() => {
	grabHandle.value!.addEventListener("touchstart", touchStart, { passive: false })
})
onUnmounted(() => {
	grabHandle.value?.removeEventListener("touchstart", touchStart)
})
</script>
