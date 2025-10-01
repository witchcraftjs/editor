<template>
<WPopup
	:model-value="!!activeMarkMenu"
	:preferred-horizontal="['center-most']"
	:preferred-vertical="['top-most']"
	:modify-position="modifyPopupToMenuBounds"
	:use-backdrop="false"
	class="[&>div]:transition-[left,top] duration-30"
	ref="popupComponent"
>
	<template #popup="{ extractEl }">
		<div
			tabindex="0"
			class="p-2"
			:ref="_ => { extractEl(_); menuEl = _ as HTMLElement }"
			@keydown.esc="close"
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
		</div>
	</template>
</WPopup>
</template>

<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3"
import WPopup from "@witchcraft/ui/components/LibPopup"
import { copy } from "@witchcraft/ui/helpers/copy"
import type { IPopupReference, PopupPositionModifier, SimpleDOMRect } from "@witchcraft/ui/types"
import {
	computed,
	inject,
	nextTick,
	ref,
	useTemplateRef,
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

const popupComponent = useTemplateRef("popupComponent")
const menuEl = ref<HTMLElement | null>(null)
const virtualEditorEl = ref<IPopupReference | null>(null)
const virtualCursorEl = ref<IPopupReference | null>(null)

function virtualCursorGetBoundingClientRect(): SimpleDOMRect {
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
	return {
		x: leftMost,
		y: topMost,
		top: topMost,
		bottom: bottomMost,
		left: leftMost,
		right: rightMost,
		width: rightMost - leftMost,
		height: bottomMost - topMost
	}
}

function virtualEditorGetBoundingClientRect(): SimpleDOMRect {
	// constrain it horizontally to the editor
	// but not vertically
	// this is so we can later modify the position when we know the height of the menu
	// so at most it's allowed to be one menu height above the editor unless it hit the window already (which is handled here)
	// it being below shouldn't be a problem since we're using top-most positioning
	// it's guarded against below anyways
	const editorRect = props.editor.view.dom.getBoundingClientRect()
	const bodyRect = document.body.getBoundingClientRect()
	return {
		x: editorRect.x,
		left: editorRect.left,
		right: editorRect.right,
		width: editorRect.width,

		y: 0,
		top: 0,
		bottom: bodyRect.bottom,
		height: bodyRect.height
	}
}

const modifyPopupToMenuBounds: PopupPositionModifier = (pos, reference, popup, _bg, space) => {
	const editorRect = props.editor.view.dom.closest(".editor-wrapper")?.getBoundingClientRect()
	if (!editorRect) {
		throw new Error("MarkMenuManager: The wrapping scrollable editor component must have the `editor-wrapper` class for mark menus to work as they need to know the position of the scrollable wrapper.")
	}
	const yMin = Math.max(editorRect.top - popup.height, 0)
	if (pos.y < yMin) pos.y = yMin

	// under no circumstances should	the menu be over the cursor
	// the popup menu algorithm doesn't allow for not covering the reference element
	// so we manually stick it above/below
	if (reference && pos.y + popup.height > reference.top) {
		pos.y = space.bottom > space.top
			? reference.bottom
			: reference.top - popup.height
	}
	return pos
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
		} else if (!menuEl.value?.contains(e.relatedTarget as Node)) {
			close(e)
		}
	}
}

watchEffect(() => {
	if (activeMarkMenu.value) {
		document.addEventListener("click", checkMenuBlur)
		virtualCursorEl.value = { getBoundingClientRect: virtualCursorGetBoundingClientRect }
		popupComponent.value?.setReference(virtualCursorEl.value)
		virtualEditorEl.value = { getBoundingClientRect: virtualEditorGetBoundingClientRect }
		popupComponent.value?.setBackground(virtualEditorEl.value)
	} else {
		document.removeEventListener("click", checkMenuBlur)
		virtualCursorEl.value = null
		popupComponent.value?.setReference(virtualCursorEl.value!)
		virtualEditorEl.value = null
		popupComponent.value?.setBackground(virtualEditorEl.value)
	}
})
const recompute = () => {
	nextTick(() => {
		popupComponent.value?.recompute()
	})
}
function updateState() {
	const state = menusPluginKey.getState(props.editor.state)
	if (state?.menu?.type === "mark" && state.canShow) {
		activeMarkMenu.value = state?.menu?.name
		recompute()
	} else {
		activeMarkMenu.value = undefined
	}
}

// mmm feels weird when moving upwards
// const debouncedRecompute = throttle(recompute, 1000, { leading: true, trailing: true })
// menu is mounted once then hidden so we have to listen directly
// also tiptap's shouldShow does not work well
// hooking into transactions directly to avoid issues
watch(() => props.editor, (newVal, oldVal) => {
	oldVal.off("transaction", updateState)
	newVal.on("transaction", updateState)
})
props.editor.on("transaction", updateState)
</script>
