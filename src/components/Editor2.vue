<template>
<div class="template" ref="templateEl">
	<editor-content :editor="editor"/>
	<div ref="listEl">
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
import { EditorContent, useEditor } from "@tiptap/vue-3"
import { onMounted, reactive, ref } from "vue"

import List from "./List.vue"

import { RootExtension } from "../schema.js"
import { toList } from "../utils/internal/toList.js"


const listEl = ref<HTMLElement | null>(null)

const list = reactive(toList([
	["<h1>A1",
		["B2\n       ",
			["C3",
				// "D0",
				// "D1",
				"D4"]],
		["B5",
			["C6",
				"D7"]]],

	["A8",
		["B9",
			["C10",
				"D11"],
			"C12"],
		"B13",
		["B14",
			"C15",
			"C16",
			"C17",
			"C18"],
		"B19"],
	["A8",
		["B9",
			["C10",
				"D11"],
			"C12"],
		"B13",
		["B14",
			"C15",
			"C16"]],
	[
		"<h1>H1",
		"<h2>H2",
		"<h3>H3",
		"<h4>H4",
		"<h5>H5",
		"<h6>H6",
	],
],
))


const editor = useEditor({
	extensions: [
		RootExtension,
	],
})
onMounted(() => {
	editor.value!.commands.setContent(listEl.value!.innerHTML, false)
})
</script>
<style lang="css">


</style>
