<template>
<div
	:class="twMerge(`
		editor-wrapper
		[counter-reset:none]
		flex-1
		w-full
	`,
		isEmbedded && `p-1`,
		isScrolling && `
			relative
			after:content-['']
			after:absolute
			after:inset-0
			after:border-[length:var(--pmDragScrollMargin)]
			after:border-transparent
			after:pointer-events-none
		`,
		scrollIndicator.right && `after:border-r-accent-500/60`,
		scrollIndicator.down && `after:border-b-accent-500/60`,
		scrollIndicator.left && `after:border-l-accent-500/60`,
		scrollIndicator.up && `after:border-t-accent-500/60`
	)"
	:data-code-blocks-theme-is-dark="codeBlocksThemeIsDark"
	:style="`${cssVariablesString}`"
	v-bind="$attrs"
>
	<!-- The class `is-embedded-block` is not needed internally, but is added for consistency in case it might be useful. -->
	<!-- @vue-expect-error -->
	<editor-content
		:editor="editor! as any"
		spellcheck="false"
		:class="twMerge(`
			w-full flex-1
			p-2
			pl-6
			[&>.ProseMirror]:outline-hidden
			overflow-auto
		`,
			isEmbedded && `editor-is-embedded`,
			isEmbeddedBlock && `editor-is-embedded-block`
		)"
		v-extract-root-el="(el:HTMLElement) => editorContainerEl = el"
	/>
	<MarkMenuManager
		v-if="editor && !finalEditorOptions?.editable"
		:editor="editor as any"
	/>
	<ItemMenu
		v-if="editor"
		:editor="editor as any"
	/>
</div>
</template>

<script lang="ts" setup>
import { keys } from "@alanscodelog/utils"
import type { Content, EditorOptions } from "@tiptap/core"
import { EditorContent } from "@tiptap/vue-3"
import { useScrollNearContainerEdges } from "@witchcraft/ui/composables/useScrollNearContainerEdges"
import { vExtractRootEl } from "@witchcraft/ui/directives/vExtractRootEl"
import type { ScrollNearContainerEdgesOptions } from "@witchcraft/ui/types/index"
import { twMerge } from "@witchcraft/ui/utils/twMerge"
import { computed, type ComputedRef, inject, provide, ref, toRef, toRefs, watch } from "vue"

import handleCollapseIndicatorImage from "../assets/handle-arrow.svg"
import handleImage from "../assets/handle-border-circles-single.svg"
import { useEditor } from "../composables/useEditor.js"
import { useWindowDebugging } from "../composables/useWindowDebugging.js"
import { editorCssVariablesInjectionKey, editorScrollInjectionKey } from "../injectionKeys.js"
import ItemMenu from "../pm/features/Blocks/components/ItemMenu.vue"
import { statefulStates } from "../pm/features/Blocks/states/stateful.js"
import { statesInjectionKey } from "../pm/features/Blocks/types"
import { lowlightInstance } from "../pm/features/CodeBlock/CodeBlock.js"
import { useAsyncCodeBlockHighlighting } from "../pm/features/CodeBlock/composables/useAsyncCodeBlockHighlighting"
import { codeBlockThemeIsDarkInjectionKey } from "../pm/features/CodeBlock/types"
import { useEditorContent } from "../pm/features/DocumentApi/composables/useEditorContent"
import { documentApiInjectionKey, type DocumentApiInterface } from "../pm/features/DocumentApi/types.js"
import { embededEditorOptionsInjectionKey, isEmbeddedBlockInjectionKey, isEmbeddedInjectionKey, parentEditorIdInjectionKey } from "../pm/features/EmbeddedDocument/types"
import type { EditorLinkOptions } from "../pm/features/Link/types"
import MarkMenuManager from "../pm/features/Menus/components/MarkMenuManager.vue"
import { extensions } from "../pm/schema.js"
import { type CssVariables, type MenuRenderInfo, menusInjectionKey } from "../types/index.js"


const props = withDefaults(defineProps<
	{
		/** The content for the editor. It is better to use docId and the documentApi instead. */
		content?: Content
		docId?: string
		/** The document api, required for the root editor if using nested embeds. This is provided as the documentApi using the documentApiInjectionKey. */
		documentApi?: DocumentApiInterface
		/** The link options, required for the root editor. Not required for embedded editors. */
		linkOptions?: EditorLinkOptions
		/** See my component library's (@witchcraft/ui) useScrollNearContainerEdges composable for more info. */
		dragScrollOptions?: Pick<
			ScrollNearContainerEdgesOptions,
			"scrollMargin" | "outerScrollMargin" | "fastPixelMultiplier"
		>
		cssVariables?: Partial<CssVariables>
		editorOptions?: Partial<EditorOptions>
		codeBlocksThemeIsDark?: boolean
		menus?: Record<string, MenuRenderInfo>
	}>(), {
	codeBlocksThemeIsDark: false,
	content: undefined,
	docId: undefined,
	documentApi: undefined,
	linkOptions: undefined,
	cssVariables: () => ({ }),
	editorOptions: () => ({
		// todo user configurable
		enablePasteRules: true,
		enableInputRules: true
	}),
	dragScrollOptions: () => ({
		scrollMargin: 15,
		outerScrollMargin: 15,
		fastPixelMultiplier: 8
	}),
	menus: () => ({})
})
const editorContainerEl = ref<HTMLElement | null>(null)
const scroll = useScrollNearContainerEdges({
	containerEl: editorContainerEl,
	...props.dragScrollOptions
})
const {
	isScrolling,
	scrollIndicator
} = scroll
provide(editorScrollInjectionKey, scroll)

const isEmbedded = inject(isEmbeddedInjectionKey, false)
const isEmbeddedBlock = inject(isEmbeddedBlockInjectionKey, ref(false))
const cssVariables = computed(() => (isEmbedded
	? {}
	: {
		pmUnfocusedSelectionColor: "rgb(129,163,234)",
		pmNodeTypeMargin: "var(--dragHandleMargin)",
		pmCodeBlockBgColor: "",
		pmMaxEmbedWidth: "800px",
		pmDragScrollMargin: `${props.dragScrollOptions.scrollMargin}px`,
		dragHandleSize: "9px",
		dragHandleMargin: "5px",
		dragHandleImage: `url("${handleImage}")`,
		dragHandleCollapseIndicatorImage: `url("${handleCollapseIndicatorImage}")`,
		...props.cssVariables
	} satisfies CssVariables))
const cssVariablesString = computed(() => keys(cssVariables.value)
	.map(key => `--${key}: ${cssVariables.value[key]};`).join(""))

// const linkOptions = toRef(props, "linkOptions")
const menus = toRef(props, "menus")

const alreadyProvidedDocumentApi = inject(documentApiInjectionKey, undefined)
if (!isEmbedded) {
	const statefulStatesRef = ref(statefulStates)
	const alreadyProvidedStatefulStates = inject(statesInjectionKey, undefined)
	if (!alreadyProvidedStatefulStates) {
		provide(statesInjectionKey, statefulStatesRef)
	}

	const codeBlockThemeIsDark = toRef(props, "codeBlocksThemeIsDark")
	const alreadyProvidedCodeBlockThemeIsDark = inject(codeBlockThemeIsDarkInjectionKey, undefined)
	if (!alreadyProvidedCodeBlockThemeIsDark) {
		provide(codeBlockThemeIsDarkInjectionKey, codeBlockThemeIsDark)
	}

	const alreadyProvidedEditorCssVariables = inject(editorCssVariablesInjectionKey, undefined)
	if (!alreadyProvidedEditorCssVariables) {
		provide(editorCssVariablesInjectionKey, cssVariables as ComputedRef<CssVariables>)
	}

	if (props.documentApi && !alreadyProvidedDocumentApi) {
		provide(documentApiInjectionKey, props.documentApi)
	}
	if (menus.value) {
		provide(menusInjectionKey, menus)
	}
}

const finalEditorOptions: Partial<EditorOptions> = {
	enableInputRules: true,
	enablePasteRules: true,
	...props.editorOptions,
	// force extensions to be their own instance per embedded editor
	// see https://github.com/ueberdosis/tiptap/issues/4317
	// and https://github.com/ueberdosis/tiptap/issues/2694
	extensions: (props.editorOptions?.extensions ?? extensions) as any,
	autofocus: isEmbedded ? false : (props.editorOptions?.autofocus ?? true),
	injectCSS: false
}

provide(embededEditorOptionsInjectionKey, finalEditorOptions as any)

const emit = defineEmits<{
	(e: "load"): void
	(e: "unload"): void
}>()

const { editor, recreate } = useEditor(finalEditorOptions as any)

watch(editor, newVal => {
	if (newVal) {
		// we can't just use immediate: true because the editor is not yet mounted
		if (props.linkOptions) {
			editor.value!.commands.setLinkOpts(props.linkOptions)
		}
		emit("load")
	}
})
useWindowDebugging(editor)

/* const { langsInfo } = */useAsyncCodeBlockHighlighting({
	lowlightInstance,
	editor
})

watch(() => props.editorOptions, newVal => {
	if (newVal) {
		editor.value?.setOptions(newVal as any)
	}
}, { deep: true })

watch(() => props.linkOptions, newVal => {
	if (!isEmbedded) {
		if (newVal) {
			editor.value?.commands.setLinkOpts(newVal)
		}
	}
}, { deep: true })

const {
	content,
	docId
} = toRefs(props)

useEditorContent(
	editor,
	content,
	docId,
	props.documentApi ?? alreadyProvidedDocumentApi,
	recreate
)

provide(parentEditorIdInjectionKey, docId)

defineExpose({
	editor
})
</script>

<style>
a {
	text-decoration: underline !important;
}

.ProseMirror {
  position: relative;
}

.ProseMirror {
  word-wrap: break-word;
  white-space: pre-wrap;
  white-space: break-spaces;
  -webkit-font-variant-ligatures: none;
  font-variant-ligatures: none;
  font-feature-settings: "liga" 0; /* the above doesn't seem to work in Edge */
}

.ProseMirror [contenteditable="false"] {
  white-space: normal;
}

.ProseMirror [contenteditable="false"] [contenteditable="true"] {
  white-space: pre-wrap;
}

.ProseMirror pre {
  white-space: pre-wrap;
}

img.ProseMirror-separator {
  display: inline !important;
  border: none !important;
  margin: 0 !important;
  width: 0 !important;
  height: 0 !important;
}

@keyframes ProseMirror-cursor-blink {
  to {
    visibility: hidden;
  }
}
.ProseMirror-gapcursor {
  display: none;
  pointer-events: none;
  position:relative;
}
ul > .ProseMirror-gapcursor {
	@apply pl-[calc(var(--dragHandleSize)+var(--dragHandleMargin)+var(--spacing-1))];
}

.ProseMirror-gapcursor:after {
  content: "";
  display: block;
  position: absolute;
  top: -2px;
  width: 20px;
  border-top: 1px solid black;
  animation: ProseMirror-cursor-blink 1.1s steps(2, start) infinite;
}
.ProseMirror-focused .ProseMirror-gapcursor {
  display: block;
}

.ProseMirror-hideselection *::selection {
  background: transparent;
}

.ProseMirror-hideselection *::-moz-selection {
  background: transparent;
}

.ProseMirror-hideselection * {
  caret-color: transparent;
}
</style>
