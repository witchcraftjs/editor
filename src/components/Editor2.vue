<template>
<CommandsComp v-if="editor" :commands="commands" :editor="editor"/>
<div
	class="template
		[counter-reset:none]
		p-2
		pl-6
		"
	:style="`${cssVariablesString}`"
	ref="templateEl"
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
	<!-- <List -->
	<!-- 	:name="child.name" -->
	<!-- 	:children="child.children" -->
	<!-- 	v-for="(child, index) in list" -->
	<!-- 	:key="index" -->
	<!-- /> -->
</div>
</template>

<script lang="ts" setup>
import "prosemirror-gapcursor/style/gapcursor.css"

import { keys } from "@alanscodelog/utils"
import type { Editor } from "@tiptap/core"
import { type Commands, EditorContent, useEditor } from "@tiptap/vue-3"
import { computed, onMounted, type PropType, provide, reactive, ref, toRef } from "vue"

import CommandsComp from "./Commands.vue"
import List from "./List.vue"

import { rawCommands } from "../core/commands.js"
import { editorCssVariablesInjectionKey, statesInjectionKey } from "../injectionKeys.js"
import { RootExtension } from "../schema/schema.js"
import { statefulStates } from "../schema/stateful.js"
import type { CssVariables } from "../types.js"
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

const list = reactive(toList([
	["A1",
		["B1",
			["C1"]]],
	// ["B2",
	// 	["C3",
	// 		"D4"],
	// 	"C2"]],
	// 	"B13",
	// 	["B14",
	// 		"C15",
	// 		"C16",
	// 		"C17",
	// 		"C18"],
	// 	"B19"],

	// ["<h1>A1",
	// 	["B2\n       B2",
	// 		[["unordered-square", "C3"],
	// 			"D0",
	// 			"D1",
	// 			"D4"]],
	// 	["B5",
	// 		["C6",
	// 			"D7"]]],
	//
	// ["A8",
	// 	["B9",
	// 		["C10",
	// 			"D11"],
	// 		"C12"],
	// 	"B13",
	// 	["B14",
	// 		"C15",
	// 		"C16",
	// 		"C17",
	// 		"C18"],
	// 	"B19"],
	// // ["A8",
	// // 	["B9",
	// // 		["C10",
	// // 			"D11"],
	// // 		"C12"],
	// // 	"B13",
	// // 	["B14",
	// // 		"C15",
	// // 		"C16"]],
	// [
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


onMounted(() => {
	editor.value!.commands.setContent(listEl.value!.innerHTML, false)
	mounted.value = true
})

</script>
