<template>
<div
	tabindex="0"
	class="editor border border-red-600"
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
:root {
  --margin: 10px;
  --font-size: 1rem;
  --grip-dots: 3px;
  --selection-grip: 6px;
  --handles-size: calc(var(--grip-dots) * 3);
  --handles-spacing: 5px;
  --handles-margin-right: 10px;
  --handles-margin-left: 0px;
  --item-indent: calc((var(--handles-size) * 2) + var(--handles-spacing) + var(--handles-margin-right) + var(--handles-margin-left) + 10px);
}

.debug {
  	white-space: pre-wrap;
}
::selection {
	background:rgba(30, 99, 189, 0.8);
	// background: var(--blue10);
}
#template {display:none;}
.editor {
	width:100%;
	//hide the gap cursor when it's transitioning
	overflow:hidden;
	position:relative;
	//@include border(1px, v(gray16), $radius: v(border-radius));
	&:focus-within {
		//@include border(1px, v(gray13), $radius: v(border-radius));
		overflow: hidden;
	}
	.menu {
		.contextmenu {
			outline:none;
			position:fixed;
			padding: calc(var(--margin)/2);
			background: v(gray19);
			color: v(color-fg);
			z-index:100;
			//@include border(1px, v(gray16), $radius: 5px);
			.button {
				padding: calc(var(--margin)/2);
				//@include border(1px, v(gray10));
				&:last-of-type{
					border-bottom:unset;
				}
			}
		}
	}
	// position:relative;
	.force-move-cursor {
		cursor: move;
		.handle-inner {
			opacity: 0;
		}
	}
	.handle-outer {
		transition: 0.2s cubic-bezier(0.1,1,0.1,1);
		margin-left: calc(var(--handles-margin-left));
		width: v(handles-size);
		// psuedo element so we don't have to be calculating width - border width
		// and margins, etc, are easy to modify
		// this can be styled however, even smaller/bigger than the handle
		&::after {
			content: "";
			opacity: 0;
			transition-property: opacity;
			transition-duration: 0.5s;
			//@include pos(
			//	$top:calc(var(--margin)/2),
			//	$bottom: calc(var(--margin)/2)
			//);
			margin-right: 0 calc((var(--handles-size) - var(--selection-grip))/2);
			background: v(blue15);
		}
		&.fade-in::after {
			opacity: 0.3;
		}
		&.multiroot.fade-in::after {
			opacity: 1;
		}
		&.hover::after {
			transition-property: background;
			transition-duration: 0.3s;
			background: v(blue10);
		}
		&.dropped::after {
			opacity:1;
			transition: 0s;
		}
	}
	.ProseMirror, #template {
		white-space:pre-wrap;
		outline:none;
		//@include flex(1,1,100%);
flex:1;
flex-basis:100%;
		color:var(--color-fg);
		&.hide-selection {
			caret-color: v(color0);
			cursor: -webkit-grab;
			::selection {
				background:none;
				padding-right: 0.3em;
			}
		}
		.unfocused-selection {
			position:relative;
			z-index: 0;
			&::before {
				z-index: -1;
				content: "";
				position:absolute;
				//@include pos($right:-0.27em);
right: -0.27em;
				background:v(fake-inactive-selection);
			}
		}
		.unfocused-selection-end {
			&::before {
				right:0;
			}
		}
		@for $i from 0 through 100 {
			.item[level="#{$i}"] {
				margin-left: calc(var(--item-indent) * (#{$i} ))
			}
		}
		.item {
			cursor: inherit;
			//@include flexbox(column, nowrap, stretch);
display:flex;
flex-direction:column;

			padding: calc(var(--margin)/2);
			padding-left: var(--item-indent);
			position: relative;
			p, h1 {
				margin: 0;
				padding: 0;
			}
			.handles {
				outline:none;
				position: absolute;
				width: v(handles-size);
				left: calc(var(--handles-size) + var(--handles-margin-left) + var(--handles-spacing));
				height: calc(100% - var(--margin));
				z-index: 1;
				cursor: grab;
				//@include flexbox(column);
display:flex;
flex-direction:column;

				// enlarges the hit area ever so slightly
				&::after {
					content: "";
					position:absolute;
					//@include border(v(handles-spacing), v(color0), $radius: 5px);
					//@include pos($all: calc((var(--handles-spacing)/2) * -1));
				}
				.item-type {
					position: relative;
					width: var(--handles-size);
					z-index: 1;
					// outline:1px solid white;
					//@include flexbox(row, center, center);
display:flex;
justify-content:center;
align-items:center;
					&::before {
						content: "";
						position: absolute;
						background: white;
						border-radius:100%;
						height: calc(var(--handles-size)/3*2);
						width: calc(var(--handles-size)/3*2);
						transition-duration: 0.5s;
					}
					&.multiline {
						align-items: flex-end;
						margin-bottom: var(--grip-dots);
					}
				}
				.handle-inner {
					cursor: grab;
					outline:none;
					position:relative;
					width: v(handles-size);
					//@include flex(1, null, auto);
					flex: 1;
					z-index: 1;
					// psuedo element so we don't have to be calculating width - border width
					// and margins, etc, are easy to modify
					// this can be styled however, even smaller than the handle
					&::before {
						content: "";
						position: absolute;
						opacity: 0;
						transition-property: opacity, border;
						transition-duration: 0.5s;
						//@include pos($bottom:-1px);
bottom: -1px;
						//@include border(v(grip-dots), v(gray14), solid, null, right, left);
						// looks WAY nicer than a border at low pixel resolutions
						// also unlike border-image we can control the color
						//@include mask-border(url(../../assets/border-circles.svg), var(--grip-dots), $slice: 25 25 0 25,)
					}
				}
				&:hover {
					.item-type::before {
						box-shadow: 0 0 10px 5px v(blue15);
					}
					.handle-inner::before {
						opacity:1;
					}
				}
			}
			&.item-hover {
				.handle-inner {
					&.fade-in::before {
						opacity: 1;
					}
					&:hover::before {
						border-color: v(blue10);
					}
				}
			}
			// // hide inner handle while selecting
			.selecting .item:not(.item-selected-inside) .handle-inner {
				opacity: 0;
				&.item-selected-inside .handle-inner.fade-in::before {
					opacity: 1;
				}
			}
		}
	}
}


</style>
