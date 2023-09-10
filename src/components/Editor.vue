<template>
<div
	tabindex="0"
	class="editor"
	ref="editorEl"
	@keyup="keyupHandler"
/>
<div class="template" ref="templateEl">
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
	<!-- <pre>{{ JSON.stringify(list, null, "\t") }}</pre> -->
</template>

<script lang="ts" setup>
import { gapCursor } from "prosemirror-gapcursor"
import { history } from "prosemirror-history"
import { DOMParser } from "prosemirror-model"
import { type Command, EditorState, type Transaction } from "prosemirror-state"
import { EditorView } from "prosemirror-view"
import { onBeforeUnmount, onMounted, reactive, ref } from "vue"

import List from "./List.vue"

import { createKeydownHandler, createKeyupHandler } from "../keymap.js"
import { Item } from "../nodeviews/item.js"
import { debugSelection, dragSelectionRestorer, hoverIndicator, listFixer, selectingIndicator, selectionIndicator, unfocusedSelectionIndicator } from "../plugins/index.js"
import { schema } from "../schema.js"
import { toList } from "../utils/internal/toList.js"


const editorEl = ref<HTMLElement | null>(null)
const templateEl = ref<HTMLElement | null>(null)
let editor: EditorView

const applier = (tr: Transaction): void => {
	editor.dispatch(tr)
}
const exec = (...commands: Command[]): void => {
	for (const command of commands) {
		command(editor.state, applier, editor)
	}
}

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
]))
onMounted(() => {
	editor = new EditorView(editorEl.value, {
		state: EditorState.create({
			doc: DOMParser.fromSchema(schema).parse(templateEl.value!),
			plugins: [
				history(/* { newGroupDelay: 1000 } */),
				gapCursor(),
				selectingIndicator(),
				selectionIndicator({
					type: schema.nodes.item,
					handle: {
						end: deco => (deco as any).type.attrs.class.includes(`${schema.nodes.item.name}-selected-end`),
						start: deco => (deco as any).type.attrs.class.includes(`${schema.nodes.item.name}-selected-start`),
						modify: tr => tr.setMeta("ignore-unfocused-selection", true),
						// eslint-disable-next-line camelcase
						classes: { handle: "handle-outer", view_hover: "force-move-cursor" },
						container: editorEl.value!,
					},
					ignore: (_tr, $start, $end, node, pos, className) => {
						if ($start.start() === $end.start()) {
							return `${className} ${schema.nodes.item.name}-selected-inside`
						} else {
							const classes = [className]
							if (pos === $start.start()) classes.push(`${schema.nodes.item.name}-selected-start`)
							if (pos === $end.start()) classes.push(`${schema.nodes.item.name}-selected-end`)
							const level = $start.node().attrs.level
							if (node.attrs.level !== level) classes.push(`${schema.nodes.item.name}-selected-child`)
							return classes.join(" ")
						}
					},
				}),
				unfocusedSelectionIndicator(),
				hoverIndicator({ type: schema.nodes.item }),
				dragSelectionRestorer({ className: "hide-selection" }),
				debugSelection(),
				listFixer({ type: schema.nodes.item, container: editorEl.value! }),
			],
		}),
		handleKeyDown: createKeydownHandler(exec),
		dispatchTransaction: tr => {
			editor.updateState(editor.state.apply(tr))
		},
		nodeViews: {
			item(node, view, getPos, decos): Item { return new Item(schema.nodes.item, node, view, getPos, decos) },
		},
	})
})
onBeforeUnmount(() => {
	editor.destroy()
})
const keyupHandler = createKeyupHandler(exec)
	
</script>
<!-- import "prosemirror-gapcursor/style/gapcursor"; -->
<style lang="scss">

</style>
