<!-- The handle can also be created with a background image. The problem with this is the color is VERY hard to control. It would require a library to calculate the css filters needed to create the wanted color. todo check in browsers with unknown support, offer as fallback if needed -->
	<!--
[background:url(/src/assets/handle-border-circles.svg)_top/var(--handleSize)_round]
[opacity-50]
-->
<template>
<node-view-wrapper
	:class="twMerge(`
	group/item
	grid
	grid-cols-[calc((var(--handleSize)+var(--handleMargin))*1),1fr]
	grid-rows-[1fr]
	gap-x-1
	[grid-template-areas:'handles_content'_'._content']
`,
		passedDragThreshold &&
			`hidden`
		,
	)"
	role="listitem"
	v-bind="{
		'node-type': node.attrs.type,
		'node-state':node.attrs.state,
		'node-hide-children':node.attrs.hideChildren
	}"
	:style="`
			--counterStyle:${counterStyle};
			--nodeState:${nodeState?.icon};
			--typeHandleHeight:${typeHandleHeight}px;
	`"
	v-extract-root-el="(el:HTMLElement) => itemEl = el"
>
	<div contenteditable="false"
		:class="`
			group/handles
			[grid-area:handles]
			relative
		`"
		ref="handlesEl"
	>
		<div
			:class="` grab-handle
				absolute
				right-full
				w-[calc(var(--handleSize)+var(--handleMargin))]
				flex justify-center
				bg-gradient-to-br
				from-neutral-50
				to-neutral-100
				rounded
				py-1
				h-full
				hover:cursor-pointer
				transition-opacity
				duration-[450ms]
				before:w-[var(--handleSize)]
				before:bg-neutral-300
				before:[mask-image:url(/src/assets/handle-border-circles-single.svg)]
				before:[mask-repeat:space]
				before:[mask-size:calc(var(--handleSize)/2.1)]
				before:[mask-position:center]
				opacity-0
				hover:opacity-100
				group-hover/handles:opacity-100
			`"
			@pointerdown="grabPointerDown"
		/>
		<div
			:class="twMerge(`
					hover:cursor-pointer
					collapse-indicator
					absolute
					flex items-center justify-center
					h-[var(--typeHandleHeight)]
					w-[calc(var(--handleSize)+var(--handleMargin))]
					transition-all
					opacity-0
					group-hover/handles:opacity-100

				`,
				hasChildren && `
					before:bg-neutral-500
					before:h-[var(--handleSize)]
					before:w-[var(--handleSize)]
					before:block
					before:[mask-image:url(/src/assets/handle-arrow.svg)]
					before:[mask-size:contain]
					before:[mask-position:center]
					before:[mask-repeat:no-repeat]
				`,
				hasChildren && !node.attrs.hideChildren && `
					before:rotate-90
				`,
				hasChildren && node.attrs.hideChildren && `
					opacity-50
				`,
			)"
			@pointerdown="collapseIndicatorPointerDown"
		/>
	</div>
	<div
		:class="twMerge(`
		content
		[grid-area:content]
		[counter-reset:ordered]
		relative
		flex
		`,
			node.attrs.hideChildren && `
					[&_div[node-type='list']]:hidden
			`
		)"
		role="list"
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
					after:[content:var(--nodeState)]
					after:cursor-pointer
					hover:after:[content:var(--nodeState)]
					hover:after:[filter:drop-shadow(0px_1px_1px_rgba(0,0,0,0.4))]
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
		<node-view-content class="block w-full"/>
	</div>
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
</node-view-wrapper>
</template>

<script setup lang="ts">
import { pretty, unreachable } from "@alanscodelog/utils"
import { LibDebug } from "@alanscodelog/vue-components/components/index.js"
import { extractRootEl as vExtractRootEl } from "@alanscodelog/vue-components/directives/index.js"
import { NodeViewContent, nodeViewProps, NodeViewWrapper } from "@tiptap/vue-3"
import { Fragment, Slice } from "prosemirror-model"
import { NodeSelection, type Selection, TextSelection } from "prosemirror-state"
import { ReplaceAroundStep } from "prosemirror-transform"
import { twMerge } from "tailwind-merge"
import { computed, inject, onMounted, ref, watch } from "vue"

import { useDragWithThreshold } from "../composables/useDragWithThreshold.js"
import { useHandleHeight } from "../composables/useHandleHeight.js"
import { useHasChildren } from "../composables/useHasChildren.js"
import { useNodeStates } from "../composables/useNodeStates.js"
import { statesInjectionKey } from "../injectionKeys.js"
import type { Point } from "../types.js"
import { DROP_X, DROP_Y, dropPointInfo } from "../utils/dropPointInfo.js"
import { debugNode } from "../utils/internal/debugNode.js"


const props = defineProps(nodeViewProps)
const itemEl = ref<HTMLElement | null>(null)
const handlesEl = ref<HTMLElement | null>(null)
const listEl = ref<HTMLElement | null>(null)

const { checkHasChildren, hasChildren } = useHasChildren(listEl)

const { handleHeight: typeHandleHeight, recalculateHandleHeight } = useHandleHeight(handlesEl, listEl)

// const node = toRef(props, "node")
watch(() => props.node, () => {
	checkHasChildren()
	recalculateHandleHeight()
})

const states = inject(statesInjectionKey)
const { nodeState, counterStyle } = useNodeStates(props)


const {
	initialOffset,
	pointerCoords,
	passedDragThreshold,
	startDragThresholdCheck,
	endDragThresholdCheck,
	checkDragThreshold,
} = useDragWithThreshold()

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
let savedSel: Selection | undefined
function escapeDrag(e: KeyboardEvent) {
	if (e.code === "Escape") {
		document.querySelector("#clone")!.innerHTML = ""
		draggedEl.value = null
		endDragThresholdCheck()
		document.removeEventListener("keyup", escapeDrag)
		document.removeEventListener("pointermove", grabPointerMove)
		document.removeEventListener("pointerup", grabPointerUp)
		if (savedSel) {
			props.editor.commands.setTextSelection(savedSel)
		}
		savedSel = undefined
	}
}
function grabPointerDown(e: PointerEvent): void {
	startDragThresholdCheck(e)
	e.preventDefault()
	savedSel = props.editor.state.selection
	document.addEventListener("pointermove", grabPointerMove)
	document.addEventListener("pointerup", grabPointerUp)
	document.addEventListener("keyup", escapeDrag)
}
function grabPointerMove(e: PointerEvent): void {
	e.preventDefault()
	checkDragThreshold(e)
	if (passedDragThreshold.value) {
		if (!draggedEl.value) {
			draggedEl.value = itemEl.value!.cloneNode(true) as HTMLElement
			setTimeout(() => {
				document.querySelector("#clone")!.append(draggedEl.value!)
			})
			// !.append(draggedEl.value)
		}
		
		if (pointerCoords.value && e.target instanceof HTMLElement) {
			const editorBox = props.editor.view.dom.getBoundingClientRect()
			const target = document.elementFromPoint(editorBox.x + editorBox.width - 1, pointerCoords.value.y)
			// eslint-disable-next-line @typescript-eslint/prefer-optional-chain
			if (!target || !target.classList.contains("pm-block")) return
			const realBox = target.getBoundingClientRect()
			// todo get from css variables
			const indentX = (9 + 5 + 5) - 1 // wut, where are u coming from 1 ???
			const dropIndicatorHeight = 5
			const dropInfo = dropPointInfo(pointerCoords.value, realBox, indentX)
			dropoverEl = target
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

		// dragging
	}
}
window.debugNode = debugNode
function grabPointerUp(_e: PointerEvent): void {
	// handle as click
	if (!passedDragThreshold.value) {
		

	// props.editor.chain()
	} else {
		// handle as drag end
		document.querySelector("#clone")!.innerHTML = ""
		draggedEl.value = null
		savedSel = undefined
		if (dropoverEl && dropIndicator.value) {
			const schema = props.editor.schema
			const nodes = props.editor.schema.nodes
			const pos = props.editor.view.posAtDOM(dropoverEl, 0)
			const $pos = props.editor.state.doc.resolve(pos + 1)
			const node = $pos.node()
			debugNode(node, "dropover")
			const dropType = dropIndicator.value.type
			// const selfSel = NodeSelection.create(props.editor.state.doc, props.getPos())
			const tr = props.editor.state.tr
			if (dropType === "after") {
				const $self = props.editor.state.doc.resolve(props.getPos() + 1)
				debugNode($self.node(), "self")
				const slice = tr.doc.slice($self.start() - 1, $self.end() + 1)
				debugNode(slice, `${$self.start() - 1}-${$self.end() + 1} - ${slice.openStart} ${slice.openEnd}`, true, true, ["size"])
				// the "next" resolved pos
				// could be a child list or a wrapping list
				const $next = tr.doc.resolve($pos.end() + 2)
				const isWrapping = $pos.end() > $next.start() && $pos.end() < $next.end()
				if (isWrapping) {
					tr.replace($pos.end(), undefined, slice)
				} else {
					const start = $pos.end() + 1
					const end = $pos.end(-1)
					console.log(start, end)
					// const list = schema.list!.createAndFill(undefined)
					const item = nodes.item.create({}, [nodes.paragraph.create({}, schema.text("Test")), nodes.list.create({})])
					const slice = new Slice(Fragment.from([nodes.item.create({}), item]), 1, 1)
					debugNode(slice)
					tr.step(new ReplaceAroundStep(
						start, end, start, end, slice, item.nodeSize - 1, false,
					))

					// tr.replace($pos.end() + 1, $pos.end(-1), slice)
					// const frag = schema.list!.create(undefined, slice.content)
					// console.log($pos.end())
					// debugNode(slice, `${slice.openStart}-${slice.openEnd}`)
					// debugNode(frag, `${slice.openStart}-${slice.openEnd}`)
					// // console.log(list)
					//
					// // frag.append(Fragment.from(list))
					// // const s = new Slice(Fragment.from(list), 1, 1)
					// // console.log(pretty(s.toJSON()), $pos.end())
					// // debugNode(s)
					// console.log($pos.end(), $pos.end(-1))
					// console.log(tr.doc.slice($pos.end() + 1, $pos.end(-1)))
					// tr.replace($pos.end(), $pos.end(), slice)
				}
			}
			props.editor.view.dispatch(tr)
			// // tr.insert(dropPos, slice.)
			// // tr.replaceRange
			// console.log($self.start() - 1, $self.end() + 1)
			// console.log({ dropPos })
			// // tr.deleteRange($self.start(), $self.end())
			// props.editor.chain()
			// 	.focus()
			// 	.deleteRange
			// 	.cut(selfSel, dropPos)
			// 	.setTextSelection({ from: dropPos, to: dropPos })
			// 	.run()
		}
		// if (pointerCoords.value) {
		// 	const wantedPos = props.editor.view.posAtCoords({
		// 		left: pointerCoords.value.x,
		// 		top: pointerCoords.value.y,
		// 	})?.pos
		// 	if (wantedPos) {
		// 		const $pos = props.editor.state.doc.resolve(props.getPos() + 1)
		// 		const sel = TextSelection.create(props.editor.state.doc, $pos.start(), $pos.end())
		// 		props.editor.chain()
		// 			.focus()
		// 			.cut(sel, wantedPos)
		// 			.setTextSelection({ from: wantedPos, to: wantedPos })
		// 			.run()
		// 	}
		// }
		dropoverEl = undefined
		dropIndicator.value = undefined
	}
	endDragThresholdCheck()
	document.removeEventListener("pointermove", grabPointerMove)
	document.removeEventListener("pointerup", grabPointerUp)
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
onMounted(() => {
	checkHasChildren()
	recalculateHandleHeight()
})
</script>
