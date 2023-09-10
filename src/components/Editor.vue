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
// import { chainCommands, createParagraphNear, deleteSelection, joinBackward, liftEmptyBlock, newlineInCode, splitBlock, toggleMark } from "prosemirror-commands"
import { gapCursor } from "prosemirror-gapcursor"
import { history, redo, undo } from "prosemirror-history"
import { DOMParser, Schema } from "prosemirror-model"
import { type Command, EditorState, type Transaction } from "prosemirror-state"
import { EditorView } from "prosemirror-view"
import { onBeforeUnmount, onMounted, reactive, ref } from "vue"

import List from "./List.vue"

//
import { enter /* move_list_up  */ } from "../commands/index.js"
// import { backspace } from "./commands/backspace"
// import { lift_list } from "./commands/lift_list"
// import { move_list_down } from "./commands/move_list_down"
// import { sink_list } from "./commands/sink_list"
// import { debug_sel, to_list } from "./dev_utils"
import { createKeydownHandler, createKeyupHandler } from "../keymap.js"
// import List from "./List.vue"
// import { Item } from "./nodeviews/item"
// import { selection_indicator } from "./plugins"
// import { debug_selection } from "./plugins/debug_selection"
// import { drag_selection_restorer } from "./plugins/drag_selection_restorer"
// import { hover_indicator } from "./plugins/hover_indicator"
// import { list_fixer } from "./plugins/list_fixer"
// import { selecting_indicator } from "./plugins/selecting_indicator"
// import { unfocused_selection_indicator } from "./plugins/unfocused_selection_indicator"
import { schema } from "../schema.js"
// import type { Command, Dispatch } from "./types"
// import { any } from "./utils"
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
				// selecting_indicator(),
				// selection_indicator({
				// 	type: schema.nodes.item,
				// 	handle: {
				// 		end: deco => (deco as any).type.attrs.class.includes(`${schema.nodes.item.name}-selected-end`),
				// 		start: deco => (deco as any).type.attrs.class.includes(`${schema.nodes.item.name}-selected-start`),
				// 		modify: tr => tr.setMeta("ignore-unfocused-selection", true),
				// 		classes: { handle: "handle-outer", view_hover: "force-move-cursor" },
				// 		container: editor_el.value as HTMLElement,
				// 	},
				// 	ignore: (_tr, $start, $end, node, pos, class_name) => {
				// 		if ($start.start() === $end.start()) {
				// 			return `${class_name} ${schema.nodes.item.name}-selected-inside`
				// 		} else {
				// 			let classes = [class_name]
				// 			if (pos === $start.start()) classes.push(`${schema.nodes.item.name}-selected-start`)
				// 			if (pos === $end.start()) classes.push(`${schema.nodes.item.name}-selected-end`)
				// 			let level = $start.node().attrs.level
				// 			if (node.attrs.level !== level) classes.push(`${schema.nodes.item.name}-selected-child`)
				// 			return classes.join(" ")
				// 		}
				// 	},
				// }),
				// unfocused_selection_indicator(),
				// hover_indicator({ type: schema.nodes.item }),
				// drag_selection_restorer({ class_name: "hide-selection" }),
				// debug_selection(),
				// list_fixer({ type: schema.nodes.item, container: editor_el.value as HTMLElement }),
			],
		}),
		handleKeyDown: createKeydownHandler(exec),
		dispatchTransaction: tr => {
			editor.updateState(editor.state.apply(tr))
		},
		nodeViews: {
			/* eslint-disable @typescript-eslint/naming-convention */
			// item(node, view, get_pos, decos): Item { return new Item(schema.nodes.item, node, view, get_pos, decos) },
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
