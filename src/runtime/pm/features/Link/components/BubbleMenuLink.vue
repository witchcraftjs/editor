<template>
<!-- Every focusable element needs to checkCloseOnBlur to preserve focus when focusing to another element inside the component -->

<div
	v-if="showBubbleMenu"
	tabindex="0"
	:class="twMerge(`
		rounded-sm
		border-neutral-300
		dark:border-neutral-700
		border
		bg-neutral-50
		dark:bg-neutral-950
		p-2
	`)"
>
	<bubble-menu-external-link
		v-if="!isInternalLink"
		:editor="editor"
		:link-suggestions="finalLinkSuggestions"
		:link-mark="linkMark"
		:is-changed="isChanged"
		ref="component"
		v-model:link-href="linkHref"
		v-model:link-text-value="linkTextValue"
		@close="close"
		@copy="copy"
		@remove="removeLink"
	/>
	<bubble-menu-internal-link
		v-if="isInternalLink"
		:editor="editor"
		:link-suggestions="finalInternalLinkSuggestions"
		:link-mark="linkMark"
		:is-changed="isChanged"
		:get-internal-link-href="getInternalLinkHref"
		ref="component"
		v-model:link-text="linkTextValue"
		@close="close"
		@copy="copy"
		@remove="removeLink"
	/>
</div>
</template>

<script setup lang="ts">
import { unreachable } from "@alanscodelog/utils/unreachable"
import type { Mark } from "@tiptap/pm/model"
import type { Editor } from "@tiptap/vue-3"
import { copy } from "@witchcraft/ui/helpers/copy"
import { twMerge } from "@witchcraft/ui/utils/twMerge"
import { computed, nextTick, onBeforeUnmount, onMounted, ref, toRaw, watch } from "vue"

import BubbleMenuExternalLink from "./BubbleMenuExternalLink.vue"

import { getMarkPosition } from "../../../utils/getMarkPosition.js"
import { getMarksInSelection } from "../../../utils/getMarksInSelection.js"
import { linkMenuPluginKey } from "../types.js"

const props = defineProps<{
	editor: Editor
	linkSuggestions?: string[]
	internalLinkSuggestions?: string[]
	getLinkSuggestions?: (href: string, text: string) => string[]
	getLinkInternalSuggestions?: (href: string) => string[]
	getInternalLinkHref: (title: string) => string
}>()

const component = ref<InstanceType<typeof BubbleMenuExternalLink>>()
// const bubbleEl = ref<HTMLElement | null>(null)
const showBubbleMenu = ref(false)
const linkHref = ref("")
const linkTextValue = ref("")
const originalLinkTextValue = ref("")
const isInternalLink = ref(false)
const linkMark = ref<Mark | undefined>()

function updateFromMark(mark: Mark | undefined) {
	linkHref.value = mark?.attrs.href ?? ""

	const state = props.editor.state
	const sel = state.selection
	if (mark) {
		// grab text from mark
		const markPos = getMarkPosition(state, toRaw(mark.type), sel.from)
		if (!markPos) unreachable()
		linkTextValue.value = state.doc.cut(markPos.from, markPos.to).textContent
	} else {
		if (!sel.empty) {
			// grab text from selection
			linkTextValue.value = state.doc.cut(sel.from, sel.to).textContent
		} else {
			linkTextValue.value = ""
		}
	}
	originalLinkTextValue.value = linkTextValue.value
	if (mark?.attrs.internal) {
		isInternalLink.value = true
	}
}

const isChanged = computed(() =>
	!linkMark.value
	|| originalLinkTextValue.value !== linkTextValue.value
	|| linkHref.value !== linkMark.value.attrs.href
)

function close(e?: Event): void {
	props.editor.commands.closeLinkMenu()
	e?.preventDefault()
}
function removeLink() {
	props.editor.commands.unsetLink()
	close()
}

function updateState() {
	const state = linkMenuPluginKey.getState(props.editor.state)
	if (!state) return
	const newLinkMark = getMarksInSelection(props.editor.state).find(_ => _.type.name === "link")
	const isSame = newLinkMark === linkMark.value
	linkMark.value = newLinkMark
	isInternalLink.value = state.type === "internal"
	if (!isSame || !newLinkMark) updateFromMark(state.state ? newLinkMark : undefined)

	showBubbleMenu.value = !!state.state
	if (state.state === "focus") {
		nextTick(() => {
			component.value?.focus(linkMark.value ? "link" : "text")
		})
	}
}

const finalLinkSuggestions = computed(() => props.linkSuggestions ?? props.getLinkSuggestions?.(linkHref.value, linkTextValue.value))

const finalInternalLinkSuggestions = computed(() => props.internalLinkSuggestions ?? props.getLinkInternalSuggestions?.(linkHref.value))
watch(() => props.editor.state, () => updateState())
// menu is mounted once then hidden so we have to listen directly
// also tiptap's shouldShow does not work well
// hooking into transactions directly to avoid issues

onMounted(() => {
	updateState()
	props.editor.on("transaction", updateState)
})
onBeforeUnmount(() => {
	props.editor.off("transaction", updateState)
})
</script>
