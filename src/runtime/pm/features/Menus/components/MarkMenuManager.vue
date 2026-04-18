<template>
<!-- we have a v-if on top of the should-show because it has issues -->
<BubbleMenu
	v-if="!!activeMarkMenu"
	:editor="editor"
	class="
		border
		rounded-md
		border-black/20
		shadow-md
		shadow-black/20
		bg-neutral-100
		dark:bg-neutral-800
		p-2
	"
	:should-show="() => !!activeMarkMenu"
	:get-referenced-virtual-element="() => cursorReference ?? null"
	:element="collisionBoundary"
	:update-delay="50"
	:options="{
		placement: 'top'
	}"
	:tabindex="0"
>
	<component
		v-if="menuRenderer?.component"
		:editor="editor"
		:is="menuRenderer.component"
		ref="component"
		v-bind="menuRenderer?.props?.(editor as any) ?? { editor }"
		@close="close"
		@copy="copy"
	/>
</BubbleMenu>
</template>

<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3"
import { BubbleMenu } from "@tiptap/vue-3/menus"
import { copy } from "@witchcraft/ui/helpers/copy"
import type { ReferenceElement } from "reka-ui"
import {
	computed,
	inject,
	ref,
	watch,
	watchEffect
} from "vue"

import { findUpwards } from "../../../utils/findUpwards.js"
import { type MenuRenderInfo, menusInjectionKey, menusPluginKey } from "../types.js"

const props = withDefaults(defineProps<{
	editor: Editor
}>(), {
})
const menus = inject(menusInjectionKey, ref({} as Record<string, MenuRenderInfo>))

const activeMarkMenu = ref<string | undefined>()
const menuRenderer = computed(() => {
	if (!activeMarkMenu.value) return undefined
	const menuCompInfo = menus?.value?.[activeMarkMenu.value]
	return menuCompInfo
})


const collisionBoundary = computed(() => props.editor.view.dom)
/** While tiptap's bubble menu does an okay job positioning	the menu, it still has subtle issues, so we override the positioning ourselves. We also implement pinToDistance for table, etc. */

function virtualCursorGetBoundingClientRect(): DOMRect[] {
	const opts = menuRenderer.value?.popupOptions
	const selection = props.editor.state.selection
	const doc = props.editor.state.doc
	const $fromItem = findUpwards(doc, selection.from, $pos => $pos.node().type.name === "item")?.$pos

	const end = props.editor.view.coordsAtPos(selection.to)
	const start = props.editor.view.coordsAtPos(selection.from)
	// attempt to pin to the top of the item if it's close enough
	const itemStart = props.editor.view.coordsAtPos($fromItem?.pos ?? selection.from)
	const pinToItemDistance = typeof opts?.pinToItemDistance === "function"
		? opts?.pinToItemDistance(props.editor.state as any)
		: opts?.pinToItemDistance ?? 0
	// absolute just in case, doubts it's possible
	const itemStartIsShortDistance = Math.abs(start.top - itemStart.top) < pinToItemDistance

	const leftMost = Math.min(start.left, end.left)
	const rightMost = Math.max(start.right, end.right)
	const topMost = Math.min(start.top, end.top, itemStartIsShortDistance ? itemStart.top : Infinity)
	const bottomMost = Math.max(start.bottom, end.bottom)
	return [{
		x: leftMost,
		y: topMost,
		top: topMost,
		bottom: bottomMost,
		left: leftMost,
		right: rightMost,
		width: rightMost - leftMost,
		height: bottomMost - topMost
	}] as any
}

function close(e?: Event): void {
	e?.preventDefault()
	props.editor.commands.closeOtherMenus()
}

function documentRefocusBlur(e: Event) {
	document.removeEventListener("focus", documentRefocusBlur)
	checkMenuBlur(e)
}
function checkMenuBlur(e: Event) {
	if ("relatedTarget" in e) {
		// allow window to lose focus and menu to stay open if it was focused
		// only blur if when we focus back we're outside the menu
		if (e.relatedTarget === null) {
			document.addEventListener("focus", documentRefocusBlur)
		}
		// not needed anymore, it's working better ?
		// } else if (!component.value?.contains(e.relatedTarget as Node)) {
		// 	close(e)
		// }
	}
}

watchEffect(() => {
	if (activeMarkMenu.value) {
		document.addEventListener("click", checkMenuBlur)
	} else {
		document.removeEventListener("click", checkMenuBlur)
	}
})

const cursorReference = ref<ReferenceElement | undefined>(undefined)
function updateState() {
	const state = menusPluginKey.getState(props.editor.state)
	if (state?.menu?.type === "mark" && state.canShow) {
		activeMarkMenu.value = state?.menu?.name
		cursorReference.value = {
			getClientRects: virtualCursorGetBoundingClientRect,
			getBoundingClientRect: () => virtualCursorGetBoundingClientRect()[0]
		}
	} else {
		activeMarkMenu.value = undefined
	}
}

// menu is mounted once then hidden so we have to listen directly
// tiptap's shouldShow is not perfect and menu posiitoning has issues
// hooking into transactions directly to avoid issues
watch(() => props.editor, (newVal, oldVal) => {
	oldVal.off("transaction", updateState)
	newVal.on("transaction", updateState)
})
props.editor.on("transaction", updateState)
</script>
