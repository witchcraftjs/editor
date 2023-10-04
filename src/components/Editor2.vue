<template>
<CommandsComp v-if="editor" :commands="commands" :editor="editor"/>
<div
	:class="twMerge(`template
		[counter-reset:none]
		p-2
		pl-6
	`,
		isUsingTouch && `group using-touch`,
		isDragging && `
			[caret-color:transparent]
		`
	)
	"
	:style="`${cssVariablesString}`"
	ref="templateEl"
	@pointerdown="isUsingTouch = $event.pointerType==='touch'"
>
	<editor-content :editor="editor"

		spellcheck="false"
		:class="`
	[&>.ProseMirror]:outline-none
	`"
	/>
	<div v-if="!mounted" ref="listEl">
		<List
			:name="child.name"
			:children="child.children"
			v-for="(child, index) in list"
			:key="index"
		/>
	</div>
	<List
		:name="child.name"
		:children="child.children"
		v-for="(child, index) in list"
		:key="index"
	/>
</div>
</template>

<script lang="ts" setup>
import "prosemirror-gapcursor/style/gapcursor.css"

import { keys } from "@alanscodelog/utils"
import type { Editor } from "@tiptap/core"
import { type Commands, EditorContent, useEditor } from "@tiptap/vue-3"
import { twMerge } from "tailwind-merge"
import { computed, onMounted, type PropType, provide, reactive, ref, toRef } from "vue"

import CommandsComp from "./Commands.vue"
import List from "./List.vue"

import { useWindowDebugging } from "../composables/useWindowDebugging.js"
import { rawCommands } from "../core/commands.js"
import { editorCssVariablesInjectionKey, editorStateInjectionKey, statesInjectionKey } from "../injectionKeys.js"
import { RootExtension } from "../schema/schema.js"
import { statefulStates } from "../schema/stateful.js"
import type { CssVariables } from "../types.js"
import { debugNode } from "../utils/internal/debugNode.js"
import { toList } from "../utils/internal/toList.js"


const commands = Object.keys(rawCommands).map(key => ({ key, buttons: rawCommands[key as any as keyof typeof rawCommands].buttons as any[][] }))


const props = defineProps({
	cssVariables: {
		type: Object as PropType<CssVariables>,
		required: false,
		default: () => ({
			// gripDotsSize: "3px",
			// selectionGripSize: "6px",
			itemLeftMargin: "1em",
			handleSize: "9px",
			handleMargin: "5px",
		} satisfies CssVariables),
	},
})


const statefulStatesRef = ref(statefulStates)
provide(statesInjectionKey, statefulStatesRef)
const cssVariables = toRef(props, "cssVariables")
provide(editorCssVariablesInjectionKey, cssVariables)
const cssVariablesString = computed(() => keys(props.cssVariables).map(key => `--${key}: ${props.cssVariables[key]};`).join(""))

const listEl = ref<HTMLElement | null>(null)
const mounted = ref(false)
const isUsingTouch = ref(false)
const isDragging = ref(false)
provide(editorStateInjectionKey, {
	isUsingTouch,
	isDragging,
})


const list = reactive(toList([
	["A 1 ",
		["B 1 \n       B 1",
			[["unordered-square", "C 1"],
				["D 1", ["E 1"]],
				"D 2",
				"D 3"]],
		["B 2",
			["C 1",
				"D 1"]]],
	// [
	// 	"Headings",
	// 	"<h1>H1",
	// 	"<h2>H2",
	// 	"<h3>H3",
	// 	"<h4>H4",
	// 	"<h5>H5",
	// 	"<h6>H6",
	// ],
] as any))


const editor = useEditor({
	extensions: [
		RootExtension,
	],
})
useWindowDebugging(editor)
onMounted(() => {
	editor.value!.commands.setContent(listEl.value!.innerHTML, false)
	mounted.value = true
})

</script>
