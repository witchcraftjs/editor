<!-- The handle can also be created with a background image. The problem with this is the color is VERY hard to control. It would require a library to calculate the css filters needed to create the wanted color. todo check in browsers with unknown support, offer as fallback if needed -->
	<!--
[background:url_top/var(--dragHandleSize)_round]
[opacity-50]
-->
<template>
<!-- The component requires the following global css variables to be set, see CssVariables type:
	--dragHandleSize
	--dragHandleMargin
	--dragHandleImage
	--dragHandleCollapseIndicatorImage
	--pmNodeTypeMargin
	--pmDragDropIndicatorHeight
-->
<!-- @vue-expect-error role is a valid attribute -->
<node-view-wrapper
	:class="twMerge(`
		group/item
		pl-[calc(var(--dragHandleSize)+var(--dragHandleMargin)+var(--spacing))]
		relative
	`,
		passedDragThreshold &&`
		pointer-events-none
		bg-neutral-100
		dark:bg-neutral-900
		rounded-sm
	`
	)"
	role="listitem"
	:style="`
		--counterStyle:${counterStyle};
		--nodeState:${nodeState?.icon};
		--typeHandleHeight:${typeHandleHeight}px;
	`
	"
	v-extract-root-el="(el:HTMLElement) => itemEl = el"
>
	<DragTreeHandle
		:has-children="hasChildren"
		:hide-children="node.attrs.hideChildren"
		:passed-drag-threshold="passedDragThreshold"
		:class="twMerge(
			`[&>.collapse-indicator]:h-[var(--typeHandleHeight)]`,
			hasSingularSelection && `
				group-[.using-touch]:flex
				group-[.using-touch]:opacity-100
			`
		) "
		@collapse-indicator-click="collapseIndicatorClick"
		@grab-handle-pointer-down="grabPointerDown"
		@grab-handle-passive-touch-start="touchStart"
		@grab-handle-context-menu="(editor.commands as any).toggleItemMenu(props.node.attrs.blockId)"
	/>
	<div
		contenteditable="false"
		:class="twMerge(`type-handle
				flex flex-col justify-center items-center
				w-[1.2rem]
				center
				left-[calc(var(--dragHandleSize)+var(--dragHandleMargin))+var(--pmNodeTypeMargin)]
				absolute
				z-[1]
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
		as="li"
		v-bind="node.attrs"
		:class="twMerge(`
			item-content
			[counter-reset:ordered]
			relative
			flex
			block
			full
		`,
			node.attrs.hideChildren && `
				[&_ul.list]:hidden
			`,
			node.attrs.type !== 'none' && `
				pl-[calc(1.2rem+var(--pmNodeTypeMargin))]
				`
		)"
	/>
</node-view-wrapper>
<Teleport
	v-if="passedDragThreshold && pointerCoords"
	:to="teleportTo"
>
	<div
		:id="cloneId"
		class="
				item-node-clone
				fixed
				cursor-pointer
				scale-50
				-m-2
				pointer-events-none
				select-none
				bg-bg
				dark:bg-neutral-900
				border-neutral-500
				border
				rounded-sm
				p-3
			"
		:style="`left:${pointerCoords.x}px;top:${pointerCoords.y}px`"
	/>
</Teleport>

<Teleport
	v-if="dropIndicator !== undefined && !scroll?.isScrolling.value"
	:to="teleportTo"
>
	<div
		class="
		fixed
		h-[var(--pmDragDropIndicatorHeight,5px)]
		bg-accent-500
		opacity-50
	"
		:style="`
			left:${dropIndicator.x}px;
			top:calc(${dropIndicator.y}px ${dropIndicator.type !== 'before' ? `- (var(--pmDragDropIndicatorHeight, 5px))` : ''});
			width:calc(${dropIndicator.width}px);
		`"
	/>
</Teleport>
</template>

<script setup lang="ts">
import { unreachable } from "@alanscodelog/utils/unreachable"
import type { DecorationAttrs } from "@tiptap/pm/view"
import { NodeViewContent, nodeViewProps, NodeViewWrapper } from "@tiptap/vue-3"
import { useDragWithThreshold } from "@witchcraft/ui/composables/useDragWithThreshold"
import { vExtractRootEl } from "@witchcraft/ui/directives/vExtractRootEl"
import { twMerge } from "tailwind-merge"
import { computed, inject, nextTick, onMounted, ref, watch } from "vue"

import DragTreeHandle from "./DragTreeHandle.vue"

import { editorScrollInjectionKey, editorTeleportToInjectionKey } from "../../../../injectionKeys.js"
import type { Point } from "../../../../types/index.js"
import { createDropIndicator } from "../../../utils/createDropIndicator.js"
import { dropPointInfo } from "../../../utils/dropPointInfo.js"
import { findUpwards } from "../../../utils/findUpwards.js"
import { getElMaxVisualSize } from "../../../utils/getElMaxVisualSize.js"
import { getElPropertyAsInt } from "../../../utils/getElPropertyAsInt.js"
import { debugNode } from "../../../utils/internal/debugNode.js"
import { useHandleHeight } from "../composables/useHandleHeight.js"
import { useNodeStates } from "../composables/useNodeStates.js"
import { statesInjectionKey } from "../types.js"


const props = defineProps(nodeViewProps)
const itemEl = ref<HTMLElement | null>(null)
// const grabHandle = ref<HTMLElement | null>(null)
// const listEl = ref<HTMLElement | null>(null)

const hasChildren = computed(() => props.node.childCount > 1)

const { handleHeight: typeHandleHeight, recalculateHandleHeight } = useHandleHeight(itemEl)

watch([() => props.node, () => props.decorations], () => {
	nextTick(() => {
		recalculateHandleHeight()
	})
})

const states = inject(statesInjectionKey)
const { nodeState, counterStyle } = useNodeStates(props)

const hasSingularSelection = computed(() => props.decorations.find(deco => ((deco.type as any).attrs as DecorationAttrs).hasSingularSelection))

const teleportTo = inject(editorTeleportToInjectionKey, "body")

const cloneId = `editor-item-node-clone`

const {
	pointerCoords,
	passedDragThreshold,
	startDragThresholdCheck,
	endDragThresholdCheck,
	checkDragThreshold
} = useDragWithThreshold({ threshold: ref(5) })

const scroll = inject(editorScrollInjectionKey)

if (!scroll) {
	throw new Error("editorScrollInjectionKey must be provided.")
}

const draggedEl = ref<HTMLElement | null>(null)
const dropIndicator = ref<(Point & {
	width: number
	type: "child" | "before" | "after"
}) | undefined>(undefined)
let dropoverEl: HTMLElement | undefined

// for things that only need to be set once on initial drag
let firstDragEvent = false
function stopDrag(): void {
	firstDragEvent = false
	;(props.editor.commands as any).setCursorVisible(true)
	if ("enableMarkMenus" in props.editor.commands) {
		;(props.editor.commands as any).enableMarkMenus()
	}
	endDragThresholdCheck()
	document.removeEventListener("keyup", escapeDrag)
	document.removeEventListener("pointermove", grabPointerMove)
	document.removeEventListener("pointerup", grabPointerUp)
	scroll?.endScroll()

	const clone = document.querySelector(`#${cloneId}`)
	if (clone)clone.innerHTML = ""
	draggedEl.value = null
	dropoverEl = undefined
	dropIndicator.value = undefined
}

function escapeDrag(e: KeyboardEvent): void {
	if (e.code === "Escape") stopDrag()
}
function grabPointerDown(e: PointerEvent): void {
	e.preventDefault()
	startDragThresholdCheck(e)
	if (e.button !== 0) return

	document.addEventListener("pointermove", grabPointerMove)
	document.addEventListener("pointerup", grabPointerUp)
	document.addEventListener("keyup", escapeDrag)
}
function grabPointerMove(e: PointerEvent): void {
	e.preventDefault()
	checkDragThreshold(e)
	if (passedDragThreshold.value) {
		if (!firstDragEvent) {
			firstDragEvent = true
			;(props.editor.commands as any).setCursorVisible(false)
			if ("disableMarkMenus" in props.editor.commands) {
				;(props.editor.commands as any).disableMarkMenus()
			}
		}
		if (!draggedEl.value) {
			draggedEl.value = itemEl.value!.cloneNode(true) as HTMLElement
			setTimeout(() => {
				const clone = document.querySelector(`#${cloneId}`)
				clone?.append(draggedEl.value!)
			})
		}
		scroll?.scrollEdges(e.clientX, e.clientY)
		if (pointerCoords.value && e.target instanceof HTMLElement) {
			const editorEl = props.editor.view.dom
			const editorBox = editorEl.getBoundingClientRect()
			const target = document.elementFromPoint(editorBox.x + editorBox.width - 1, pointerCoords.value.y)?.closest(".item-content > *") ?? null

			const targetIsSelf = target === itemEl.value || itemEl.value?.contains(target)
			const targetIsParentIsBlock = target?.parentElement?.classList.contains("item-content")
			const parentEl = editorEl.parentElement
			if (!parentEl || !target || targetIsSelf || !targetIsParentIsBlock) return

			// we are dragging to a different editor instance
			// this is not supported
			const dropOverPos = props.editor.view.posAtDOM(target, 0)
			if (dropOverPos < 0) { return }

			const width = getElMaxVisualSize(parentEl).width
			const targetBox = target.getBoundingClientRect()

			const indentX = getElPropertyAsInt(itemEl.value!, "padding-left")

			const dropInfo = dropPointInfo(pointerCoords.value, targetBox, indentX)
			dropoverEl = target as HTMLElement
			dropIndicator.value = createDropIndicator(dropInfo, targetBox, indentX, width)
		}
	}
}

function grabPointerUp(_e: PointerEvent): void {
	if (!passedDragThreshold.value || !props.editor.isEditable) {
		// this used to open the menu, but now that's handled by the context menu
	} else {
		if (dropoverEl && dropIndicator.value) {
			// const schema = props.editor.schema
			const dropOverPos = props.editor.view.posAtDOM(dropoverEl, 0)
			if (dropOverPos < 0) { stopDrag(); return }
			const { /* $pos: $dropPos, */ pos } = findUpwards(
				props.editor.state.doc,
				dropOverPos,
				$pos => $pos.node().type.name === "item",
				{ stop: 2 } // we shouldn't have to go more than 2 nodes up
			)
			if (!pos || !pos) { stopDrag(); return }
			const propsPos = props.getPos()
			if (!propsPos) unreachable()
			;(props.editor.commands as any).copyOrMoveItem(
				propsPos + 1,
				pos,
				dropIndicator.value.type,
				{
					move: true
				}
			)
			// dont let stop drag restore the selection
		}
	}
	stopDrag()
}
// function handleAsClick(_e: PointerEvent): void {
// 	props.editor.commands.toggleItemMenu(props.node.attrs.blockId)
// }
function collapseIndicatorClick(e: MouseEvent): void {
	const pos = props.getPos()
	if (!pos) unreachable()
	const $pos = props.editor.state.doc.resolve(pos)

	debugNode($pos.node())

	const wantedPos = pos + 2
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
	const pos = props.getPos()
	if (!pos) unreachable()
	if (nodeState.value) {
		const wantedPos = pos + 2
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
			.changeItemType({
				type: props.node.attrs.type,
				state: entries[stateIndex + 1]!.value
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
	nextTick(() => {
		recalculateHandleHeight()
	})
})
</script>
