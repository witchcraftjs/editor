<template>
<WRoot class="items-center py-4">
	<style>
		{{ codeBlocksThemeCss.join("\n") }}
	</style>
	<DemoControls
		:code-blocks-theme-list="codeBlocksThemeList"
		v-model:code-blocks-theme="codeBlocksTheme"
		@blur="blur"
	/>
	<Editor
		class="max-w-[700px] flex-1 max-h-[700px] flex"
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
	<div class="py-[50px]"/>
</WRoot>
</template>

<script setup lang="ts">
import type { EditorOptions } from "@tiptap/core"
import WRoot from "@witchcraft/ui/components/LibRoot"
import { nextTick, reactive, ref, shallowRef } from "vue"

import Editor from "../components/Editor.vue"
import DemoControls from "../components/EditorDemoControls.vue"
import { useHighlightJsTheme } from "../pm/features/CodeBlock/composables/useHighlightJsTheme.js"
import { defaultCommandBarMenuItems } from "../pm/features/CommandsMenus/commandBarMenuItems"
import CommandBar from "../pm/features/CommandsMenus/components/CommandBar.vue"
import { useTestDocumentApi } from "../pm/features/DocumentApi/composables/useTestDocumentApi.js"
import BubbleMenuLink from "../pm/features/Link/components/BubbleMenuLink.vue"
import type { EditorLinkOptions } from "../pm/features/Link/types.js"
import type { MenuRenderInfo } from "../pm/features/Menus/types"
import { testExtensions } from "../pm/testSchema.js"
import { testDocuments } from "../testDocuments"

const {
	theme: codeBlocksTheme,
	knownThemes: codeBlocksThemeList,
	themeCss: codeBlocksThemeCss,
	isDark: codeBlocksThemeIsDark,
	backgroundColor: codeBlocksThemeBgColor
} = useHighlightJsTheme()

function blur(): void {
	const was = codeBlocksTheme.value
	codeBlocksTheme.value = ""
	nextTick(() => {
		codeBlocksTheme.value = was
	})
}

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
				const fromNode = $from.node(-1)
				const toNode = $to.node(-1)
				// tables don't support selections outside of each cell, so no need to check we're in the same table or anything
				if (fromNode.type !== toNode.type) {
					return 0
				}
				return (fromNode.type.name.startsWith("table")) ? 120 : 0
			}
		}
	}
})

const { documentApi } = useTestDocumentApi(
	editorOptions as any,
	testDocuments
)
const docId = ref("root")
</script>
