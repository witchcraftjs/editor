<template>
<WRoot class="items-center py-10 gap-2 h-dvh">
	<component :is="'style'">
		<!-- use unhead in a real app -->
		{{ codeBlocksThemeCss.join("\n") }}
	</component>
	<div class="text-xl font-bold">
		<a href="https://github.com/witchcraftjs/editor">@witchcraft/editor</a>
	</div>
	<EditorDemoControls
		:code-blocks-theme-list="codeBlocksThemeList"
		v-model:code-blocks-theme="codeBlocksTheme"
		v-model:use-two-editors="useTwoEditors"
	/>

	<Editor
		class="
			max-w-[700px]
			flex-1
			flex
			border
			border-neutral-300
			dark:border-neutral-700
			rounded-sm
			min-h-0
		"
		v-bind="{
			codeBlocksThemeIsDark,
			cssVariables: {
				pmCodeBlockBgColor: codeBlocksThemeBgColor
			},
			docId,
			documentApi,
			linkOptions,
			editorOptions,
			menus
		}"
	/>
	<Editor
		v-if="useTwoEditors"
		class="
			max-w-[700px]
			flex-1
			flex
			border
			border-neutral-300
			dark:border-neutral-700
			rounded-sm
			min-h-0
		"
		v-bind="{
			codeBlocksThemeIsDark,
			cssVariables: {
				pmCodeBlockBgColor: codeBlocksThemeBgColor
			},
			docId,
			documentApi,
			linkOptions,
			editorOptions,
			menus
		}"
	/>
</WRoot>
</template>

<script setup lang="ts">
// all imports must be explicit so this also works without nuxt
import type { EditorOptions } from "@tiptap/core"
import WRoot from "@witchcraft/ui/components/LibRoot"
import { useRoute } from "nuxt/app"
import { reactive, ref, shallowRef } from "vue"

import Editor from "./Editor.vue"
import EditorDemoControls from "./EditorDemoControls.vue"

import { useHighlightJsTheme } from "../pm/features/CodeBlock/composables/useHighlightJsTheme.js"
import { defaultCommandBarMenuItems } from "../pm/features/CommandsMenus/commandBarMenuItems.js"
import CommandBar from "../pm/features/CommandsMenus/components/CommandBar.vue"
import { useTestDocumentApi } from "../pm/features/DocumentApi/composables/useTestDocumentApi.js"
import BubbleMenuLink from "../pm/features/Link/components/BubbleMenuLink.vue"
import type { EditorLinkOptions } from "../pm/features/Link/types.js"
import type { MenuRenderInfo } from "../pm/features/Menus/types"
import { testExtensions } from "../pm/testSchema.js"
import { testDocuments } from "../testDocuments.js"

const {
	theme: codeBlocksTheme,
	knownThemes: codeBlocksThemeList,
	themeCss: codeBlocksThemeCss,
	isDark: codeBlocksThemeIsDark,
	backgroundColor: codeBlocksThemeBgColor
} = useHighlightJsTheme()

const editorOptions: Partial<EditorOptions> = {
	extensions: testExtensions as any
}

const linkOptions: EditorLinkOptions = {
	openInternal: href => {
		window.alert(`This would open an internal link to ${href}.`)

		// eslint-disable-next-line no-console
		console.log(`Would open internal link to ${href}.`)
	}
}
const fakeSuggestions = reactive<string[]>(["some", "suggestions"])

const menus = shallowRef<Record<string, MenuRenderInfo>>({
	linkMenu: {
		component: BubbleMenuLink,
		props: editor => ({
			editor,
			linkSuggestions: fakeSuggestions,
			getInternalLinkHref(href: string) {
				return `internal://${href.replace(/[^\w-]/g, "")}`
			}
		})
	},
	commandBar: {
		component: CommandBar,
		props: editor => ({
			editor,
			commands: defaultCommandBarMenuItems.commands
		}),
		popupOptions: {
			pinToItemDistance: state => {
				const { $from, $to } = state.selection
				const fromNode = -1 < $from.depth ? $from.node(-1) : undefined
				const toNode = -1 < $to.depth ? $to.node(-1) : undefined
				// tables don't support selections outside of each cell, so no need to check we're in the same table or anything
				if (fromNode?.type !== toNode?.type) {
					return 0
				}
				return (fromNode?.type.name.startsWith("table")) ? 120 : 0
			}
		}
	}
})

const useYjs = useRoute().query.useYjs as string
const useTwoEditors = ref(false)

const { documentApi } = useTestDocumentApi(
	editorOptions as any,
	testDocuments,
	{ useCollab: useYjs === "true" }
)
const docId = ref("root")
</script>
