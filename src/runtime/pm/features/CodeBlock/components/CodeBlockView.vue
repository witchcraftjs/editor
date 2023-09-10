<template>
<node-view-wrapper
	:class="`
		border
		border-[var(--pmCodeBlockBgColor)]
		code-block
		bg-[var(--pmCodeBlockBgColor)]
		rounded-sm
	`"
	v-extract-root-el="(el:any) => codeBlockEl = el"
>
	<!-- dark class is not added directly to style this because we don't want to style the input, it should match the app theme instead -->
	<div
		contenteditable="false"
		:class="`
			lang-picker
			rem-[0.7]
			${codeBlockThemeIsDark
				? `bg-neutral-600`
				: `bg-neutral-400`
		}
		`"
		ref="codeBlockLangPickerEl"
	>
		<!-- and here we only style everything but the suggestions so the input matches the code block background -->
		<!-- @vue-expect-error -->
		<WSimpleInput
			:border="false"
			wrapper-class="lang-picker-input flex-nowrap z-10"
			:inner-wrapper-class="`
				${codeBlockThemeIsDark
					? `[&>*:not(.suggestions)]:text-neutral-300`
					: `[&>*:not(.suggestions)]:text-neutral-700`
			}
			`"
			suggestions-class="max-h-[200px] overflow-y-auto"
			:suggestions="keys(langsInfo.aliases)"
			:restrict-to-suggestions="true"
			:aria-label="`Language:`"
			:model-value="lang"
			@blur="lang=lang"
			@focus="savePosition"
			@submit="focusCodeBlock"
		/>
	</div>

	<!-- @vue-expect-error -->
	<node-view-content
		:class="twMerge(`
			hljs
			py-1
			px-2
			${codeBlockThemeIsDark ? `dark` : ``}
		`,
			node.attrs.language ? `language-${node.attrs.language}`: undefined
		)"
		as="pre"
		:language="node.attrs.language"
		:loading="node.attrs.loading"
	/>
</node-view-wrapper>
</template>

<script setup lang="ts">
import { keys } from "@alanscodelog/utils/keys"
import type { Selection } from "@tiptap/pm/state"
import { TextSelection } from "@tiptap/pm/state"
import { NodeViewContent, nodeViewProps, NodeViewWrapper } from "@tiptap/vue-3"
import WSimpleInput from "@witchcraft/ui/components/LibSimpleInput"
import { vExtractRootEl } from "@witchcraft/ui/directives/vExtractRootEl"
import { twMerge } from "tailwind-merge"
import { inject, ref, watch } from "vue"

import { codeBlockThemeIsDarkInjectionKey, langsInfoInjectionKey } from "../types.js"

const langsInfo = inject(langsInfoInjectionKey, ref({ languages: {}, aliases: {} }))

const codeBlockThemeIsDark = inject(codeBlockThemeIsDarkInjectionKey, ref(false))

const props = defineProps(nodeViewProps)
const lang = ref(props.node.attrs.language ?? "")
const codeBlockEl = ref<HTMLElement | null>(null)
watch(() => props.node.attrs.language, val => {
	lang.value = val
})

let savedPos: Selection | undefined
function focusCodeBlock(newVal: string): void {
	if (!codeBlockEl.value) return
	// const pos = props.getPos()
	props.editor.view.focus()
	props.editor.commands.command(({ tr, dispatch }) => {
		const thisNodePos = props.editor.view.posAtDOM(codeBlockEl.value!, 0)
		if (thisNodePos < 0) return false
		const $node = tr.doc.resolve(thisNodePos + props.node.nodeSize - 1)
		if (savedPos) {
			tr.setSelection(savedPos)
		} else {
			const sel = TextSelection.findFrom($node, -1, true)
			if (!sel) return false
			tr.setSelection(sel)
		}
		tr.setNodeMarkup($node.start(), undefined, {
			...props.node.attrs,
			language: newVal,
			loading: true
		})
		tr.scrollIntoView()
		if (dispatch) dispatch(tr)
		savedPos = undefined
		return true
	})
	codeBlockEl.value.querySelector("code")?.focus()
}

function savePosition(): void {
	if (!codeBlockEl.value) return
	const nodePos = props.editor.view.posAtDOM(codeBlockEl.value, 0)
	const $node = props.editor.state.doc.resolve(nodePos)

	savedPos = props.editor.state.selection
	if (savedPos.from < $node.start() || savedPos.to > $node.end()) {
		savedPos = undefined
	}
}
</script>
