<!-- The handle can also be created with a background image. The problem with this is the color is VERY hard to control. It would require a library to calculate the css filters needed to create the wanted color. todo check in browsers with unknown support, offer as fallback if needed -->
	<!--
[background:url(/src/assets/handle-border-circles.svg)_top/var(--handleSize)_round]
[opacity-50]
-->
<template>
<node-view-wrapper
	:class="twMerge(`
		group/item
		pl-[calc(var(--handleSize)+var(--handleMargin)+var(--spacing-1))]
		relative
	`,
		passedDragThreshold &&`
			pointer-events-none
			bg-neutral-100
			rounded
		`
		,
	)"
	role="listitem"
	v-bind="node.attrs"
	:style="`
		--counterStyle:${counterStyle};
		--nodeState:${nodeState?.icon};
		--typeHandleHeight:${typeHandleHeight}px;
	`"
	v-extract-root-el="(el:HTMLElement) => itemEl = el"
>
	<div contenteditable="false"
		:class="twMerge(`group handles
			absolute
			left-0
			w-[calc(var(--handleSize)+var(--handleMargin))]
			h-full
		`,
			passedDragThreshold &&`
			hidden
		`
		)"
	>
		<div
			:class="twMerge(` grab-handle
				absolute
-				left-0
				w-[calc(var(--handleSize)+var(--handleMargin))]
				flex justify-center
				bg-gradient-to-br
				from-neutral-50
				to-neutral-100
				rounded
				py-1
				h-full
				transition-opacity
				duration-[450ms]

				before:w-[var(--handleSize)]
				before:bg-neutral-300
				before:[mask-image:url(/src/assets/handle-border-circles-single.svg)]
				before:[mask-repeat:space]
				before:[mask-size:calc(var(--handleSize)/2.1)]
				before:[mask-position:center]
				opacity-0
				[.group.handles:hover>&]:cursor-pointer
				[.group.handles:hover>&]:opacity-100
				group-[.using-touch]:hidden
			`,
				hasSingularSelection && `
				group-[.using-touch]:flex
				group-[.using-touch]:opacity-100
			`
			)"
			ref="grabHandle"
		/>
		<div
			:class="twMerge(`
				pointer-events-none
				hover:cursor-pointer
				collapse-indicator
				absolute
				left-[-4px]
				hover:top-0
				flex items-center justify-center
				h-[var(--typeHandleHeight)]
				w-[calc(var(--handleSize)+var(--handleMargin))]
				transition-all
				opacity-0
				group-[.using-touch]:hidden
				[.group.handles:hover>&]:opacity-100
			`,
				hasChildren && `
				before:w-[calc(var(--handleSize)+var(--handleMargin))]
				before:h-[calc(var(--handleSize))]
				before:absolute

				after:bg-neutral-500
				after:h-[var(--handleSize)]
				after:w-[var(--handleSize)]
				after:absolute
				after:[mask-image:url(/src/assets/handle-arrow.svg)]
				after:[mask-size:contain]
				after:[mask-position:center]
				
				after:[mask-repeat:no-repeat]
			`,
				hasChildren && !node.attrs.hideChildren && `
				after:rotate-90
				after:translate-x-[4px]
			`,
				hasChildren && node.attrs.hideChildren && `
				group-[.using-touch]:block
				opacity-50
			`,
				hasSingularSelection && `
				group-[.using-touch]:flex
				group-[.using-touch]:opacity-100
			`,
				!hasChildren && `
				hidden
				group-[.using-touch]:hidden
			`,
			)"
		/>
	</div>
	<div
		ref="listEl"
	>
		<div
			contenteditable="false"
			:class="twMerge(`type-handle
					flex flex-col justify-center items-center
					w-[1.2rem]
					pr-1
					center
				`,

				node.attrs.type.startsWith('ordered') && `
					[counter-increment:ordered]
					after:content-[counter(ordered,var(--counterStyle))_'.']
				`,
				node.attrs.type.startsWith('unordered') && `
					after:content-[counter(none,var(--counterStyle))]
				`,
				node.attrs.type.startsWith('stateful') && `
					after:h-[1.2rem]
					after:content-[var(--nodeState)]
					after:cursor-pointer
					hover:after:[filter:drop-shadow(0px_1px_1px_rgba(0,0,0,0.4))]
					hover:after:content-[var(--nodeState)]
				`,
				node.attrs.type === 'none' && `
					hidden
				`,
				`type-${node.attrs.type}`)
			"
			:style="`
					height:var(--typeHandleHeight);
			`"
			:role="node.attrs.type.startsWith('stateful') ? 'checkbox' : ''"
			:aria-checked="node.attrs.state"
			tabindex="0"
			@pointerdown="typeHandlePointerDown"
		/>
		<node-view-content
			:class="twMerge(`content
				[counter-reset:ordered]
				relative
				flex
				block full
			`,
				node.attrs.hideChildren && `
					[&_div[node-type='list']]:hidden
				`
			)"
		/>
	</div>
</node-view-wrapper>
<Teleport v-if="passedDragThreshold && pointerCoords" to="body">
	<div
		id="clone"
		class="
				fixed
				cursor-pointer
				scale-50
				origin-top-left
				-m-2
				pointer-events-none
				select-none
				bg-white
				border-neutral-500
				border
				rounded
				p-3
			"
		:style="`left:${pointerCoords.x}px;top:${pointerCoords.y}px`"
	/>
</Teleport>
<Teleport v-if="dropIndicator" to="body">
	<div class="fixed
				w-full
				h-[5px]
				bg-blue-500
				opacity-50
				"
		:style="`left:${dropIndicator.x}px;top:${dropIndicator.y}px`"
	/>
</Teleport>
</template>

<script setup lang="ts">
import { pretty, unreachable } from "@alanscodelog/utils"
import { extractRootEl as vExtractRootEl } from "@alanscodelog/vue-components/directives/index.js"
import { NodeViewContent, nodeViewProps, NodeViewWrapper } from "@tiptap/vue-3"
import { twMerge } from "tailwind-merge"
import { computed, inject, onMounted, onUnmounted, ref, watch } from "vue"

import { useDragWithThreshold } from "../composables/useDragWithThreshold.js"
import { useHandleHeight } from "../composables/useHandleHeight.js"
import { useHasChildren } from "../composables/useHasChildren.js"
import { useNodeStates } from "../composables/useNodeStates.js"
import { editorStateInjectionKey, statesInjectionKey } from "../injectionKeys.js"
import { DROP_X, DROP_Y, dropPointInfo } from "../pm/utils/dropPointInfo.js"
import { debugNode } from "../pm/utils/internal/debugNode.js"
import type { Point } from "../types.js"


const props = defineProps(nodeViewProps)
const itemEl = ref<HTMLElement | null>(null)
const grabHandle = ref<HTMLElement | null>(null)
const listEl = ref<HTMLElement | null>(null)

const { checkHasChildren, hasChildren } = useHasChildren(listEl)

const { handleHeight: typeHandleHeight, recalculateHandleHeight } = useHandleHeight(itemEl, listEl)

// const node = toRef(props, "node")
watch([() => props.node, () => props.decorations], () => {
	checkHasChildren()
	recalculateHandleHeight()
})

const states = inject(statesInjectionKey)
const { nodeState, counterStyle } = useNodeStates(props)
const { isDragging, isUsingTouch } = inject(editorStateInjectionKey)
const hasSingularSelection = computed(() => props.decorations.find(deco => deco.type.attrs.hasSingularSelection))

const {
	initialOffset,
	pointerCoords,
	passedDragThreshold,
	startDragThresholdCheck,
	endDragThresholdCheck,
	checkDragThreshold,
} = useDragWithThreshold({ threshold: ref(5) })

// const {
//  	scrollEdges,
//  	isScrolling,
//  	scrollIndicator,
//  	endScroll,
// } = useScrollNearContainerEdges({
// todo inject? container el
//  	containerEl,
//  	scrollMargin,
//  	outerScrollMargin,
// })
const draggedEl = ref<HTMLElement | null>(null)
const dropIndicator = ref<(Point & {
	type: "child" | "before" | "after"
}) | undefined>(undefined)
let dropoverEl: HTMLElement | undefined

function stopDrag(): void {
	isDragging.value = false
	endDragThresholdCheck()
	document.removeEventListener("keyup", escapeDrag)
	document.removeEventListener("pointermove", grabPointerMove)
	document.removeEventListener("pointerup", grabPointerUp)
	
	const clone = document.querySelector("#clone")
	if (clone)clone.innerHTML = ""
	draggedEl.value = null
	dropoverEl = undefined
	dropIndicator.value = undefined
}

function escapeDrag(e: KeyboardEvent): void {
	if (e.code === "Escape") stopDrag()
}
function grabPointerDown(e: PointerEvent): void {
	startDragThresholdCheck(e)
	e.preventDefault()
	
	document.addEventListener("pointermove", grabPointerMove)
	document.addEventListener("pointerup", grabPointerUp)
	document.addEventListener("keyup", escapeDrag)
}

function grabPointerMove(e: PointerEvent): void {
	e.preventDefault()
	checkDragThreshold(e)
	isDragging.value = true
	if (passedDragThreshold.value) {
		if (!draggedEl.value) {
			draggedEl.value = itemEl.value!.cloneNode(true) as HTMLElement
			setTimeout(() => {
				const clone = document.querySelector("#clone")
				clone?.append(draggedEl.value!)
			})
		}
		
		if (pointerCoords.value && e.target instanceof HTMLElement) {
			const editorBox = props.editor.view.dom.getBoundingClientRect()
			const target = document.elementFromPoint(editorBox.x + editorBox.width - 1, pointerCoords.value.y)
			// eslint-disable-next-line @typescript-eslint/prefer-optional-chain
			const targetIsSelf = target === itemEl.value || itemEl.value?.contains(target)
			const targetIsBlock = target?.classList.contains("pm-block")
			if (!target || targetIsSelf || !targetIsBlock) return
			const realBox = target.getBoundingClientRect()
			// todo get from css variables
			const indentX = (9 + 5 + 5) - 1 // wut, where are u coming from 1 ???
			const dropIndicatorHeight = 5
			const dropInfo = dropPointInfo(pointerCoords.value, realBox, indentX)
			dropoverEl = target as HTMLElement
			const d = dropInfo
			const inBottomHalf = (d.y === DROP_Y.BOTTOM || d.y === DROP_Y.OUTSIDE_BOTTOM)
			const toRightOfIndent = (d.x === DROP_X.INSIDE_INDENT || d.x === DROP_X.OUTSIDE_RIGHT)
			if (toRightOfIndent && inBottomHalf) {
				dropIndicator.value = { type: "child", x: realBox.x + indentX, y: realBox.y + realBox.height - dropIndicatorHeight }
			} else {
				if (inBottomHalf) {
					dropIndicator.value = { type: "after", x: realBox.x, y: realBox.y + realBox.height - dropIndicatorHeight }
				} else {
					dropIndicator.value = { type: "before", x: realBox.x, y: realBox.y }
				}
			}
		}
	}
}

function grabPointerUp(_e: PointerEvent): void {
	// handle as click
	if (!passedDragThreshold.value) {
		collapseIndicatorPointerDown(_e)
	} else {
		if (dropoverEl && dropIndicator.value) {
			const schema = props.editor.schema
			const pos = props.editor.view.posAtDOM(dropoverEl, 0)
			props.editor.commands.copyOrMoveListItem(
				props.getPos() + 1,
				pos + 1,
				dropIndicator.value.type,
				{
					itemNode: schema.nodes.item!,
					listNode: schema.nodes.list!,
					move: true,
				},
			)
			// dont let stop drag restore the selection
		}
	}
	stopDrag()
}
function collapseIndicatorPointerDown(e: PointerEvent): void {
	const pos = props.getPos()
	const $pos = props.editor.state.doc.resolve(pos)

	debugNode($pos.node())

	const wantedPos = props.getPos() + 2
	const sel = props.editor.state.selection
	props.editor.chain()

		// target only the clicked on node
		.setTextSelection({ from: wantedPos, to: wantedPos })
		.changeAttrs("item", { hideChildren: !props.node.attrs.hideChildren })
		// restore selection
		.setTextSelection({ from: sel.from, to: sel.to })
		.run()
	e.preventDefault()
}

function typeHandlePointerDown(e: PointerEvent): void {
	if (nodeState.value) {
		const wantedPos = props.getPos() + 2
		const entries = states?.value[counterStyle.value as keyof typeof states.value]?.entries
		if (entries === undefined) unreachable()
		let stateIndex = entries
			.indexOf(nodeState.value)
		if (stateIndex === -1) unreachable()
		if (stateIndex + 1 >= entries.length) stateIndex = 0

		const sel = props.editor.state.selection
		if (props.editor.view.dom !== document.activeElement) {
			props.editor.commands.focus()
		}
		props.editor.chain()
			// target only the clicked on node
			.setTextSelection({ from: wantedPos, to: wantedPos })
			.changeListItemType({
				type: props.node.attrs.type,
				state: entries[stateIndex + 1]!.value,
			})
			// restore selection
			.setTextSelection({ from: sel.from, to: sel.to })
			.run()
		e.preventDefault()
	}
}
function touchStart(e: TouchEvent): void {
	e.preventDefault()
}
onMounted(() => {
	grabHandle.value!.addEventListener("pointerdown", grabPointerDown)
	grabHandle.value!.addEventListener("touchstart", touchStart, { passive: false })
	checkHasChildren()
	recalculateHandleHeight()
})
onUnmounted(() => {
	grabHandle.value?.removeEventListener("pointerdown", grabPointerDown)
	grabHandle.value?.removeEventListener("touchstart", touchStart)
})
</script>
