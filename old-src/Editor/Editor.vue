<template>
	<div
		tabindex="0"
		class="editor"
		ref="editor_el"
		@keyup="keyup_handler"
	/>
	<!-- @keydown="keydown_handler" -->
	<div class="template" ref="template_el">
		<List
			:name="child.name"
			:children_l="child.children"
			v-for="(child, index) in list"
			:key="index"
		/>
	</div>
	<!-- <pre>{{ JSON.stringify(list, null, "\t") }}</pre> -->
</template>

<script lang="ts" src="./Editor.ts"/>

<style lang="scss">
@import "~prosemirror-gapcursor/style/gapcursor";
// @import "~prosemirror-view/style/prosemirror";

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
	@include border(1px, v(gray16), $radius: v(border-radius));
	&:focus-within {
		@include border(1px, v(gray13), $radius: v(border-radius));
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
			@include border(1px, v(gray16), $radius: 5px);
			.button {
				padding: calc(var(--margin)/2);
				@include border(1px, v(gray10));
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
			@include pos(
				$top:calc(var(--margin)/2),
				$bottom: calc(var(--margin)/2)
			);
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
		@include flex(1,1,100%);
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
				@include pos($right:-0.27em);
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
			@include flexbox(column, nowrap, stretch);
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
				@include flexbox(column);
				// enlarges the hit area ever so slightly
				&::after {
					content: "";
					position:absolute;
					@include border(v(handles-spacing), v(color0), $radius: 5px);
					@include pos($all: calc((var(--handles-spacing)/2) * -1));
				}
				.item-type {
					position: relative;
					width: var(--handles-size);
					z-index: 1;
					// outline:1px solid white;
					@include flexbox(row, center, center);
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
					@include flex(1, null, auto);
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
						@include pos($bottom:-1px);
						@include border(v(grip-dots), v(gray14), solid, null, right, left);
						// looks WAY nicer than a border at low pixel resolutions
						// also unlike border-image we can control the color
						@include mask-border(url(../../assets/border-circles.svg), var(--grip-dots), $slice: 25 25 0 25,)
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
