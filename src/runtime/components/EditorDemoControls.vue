<template>
<div
	class="
		max-w-[700px]
		w-full
		flex
		flex-col
		items-center
		justify-center
		gap-2
	"
>
	<div
		class="
			flex
			gap-4
			items-center
			justify-center
			border
			border-neutral-300
			dark:border-neutral-700
			rounded-md
			p-2
		"
	>
		<!-- external is to force a reload, otherwise the editors won't work because of how they're setup for the demo (document api is created here and would need to be recreated with the route changes) -->
		<NuxtLink
			v-if="useYjs !== undefined"
			:to="{ path: '/', query: { } }"
			:external="true"
		>Go to Non-Yjs Example</NuxtLink>
		<NuxtLink
			v-else
			:to="{ path: '/', query: { useYjs: 'true' } }"
			:external="true"
		>Go to Yjs Example </NuxtLink>
		<WCheckbox v-model="useTwoEditors">
			Use Two Editors (same document)
		</WCheckbox>
	</div>
	<div
		class="
		flex
		justify-center
		items-center
		gap-2
		[&>*]:rounded-md
		[&>*]:p-2
		[&>*]:border
		[&>*]:border-neutral-300
		[&>*]:dark:border-neutral-700

	"
	>
		<div class="flex items-center gap-2">
			<span>
				Global Theme:
			</span>
			<WDarkModeSwitcher/>
		</div>
		<CodeBlockThemePicker
			:code-blocks-theme-list="codeBlocksThemeList"
			v-model:code-blocks-theme="codeBlocksTheme"
		/>
	</div>
</div>
</template>

<script setup lang="ts">
import WDarkModeSwitcher from "@witchcraft/ui/components/LibDarkModeSwitcher"
import { useRoute } from "nuxt/app"

import CodeBlockThemePicker from "./CodeBlockThemePicker.vue"

defineProps<{
	codeBlocksThemeList: string[]
}>()
const codeBlocksTheme = defineModel<string>("codeBlocksTheme", { required: true })

const useTwoEditors = defineModel<boolean>("useTwoEditors", { required: true })

const useYjs = useRoute().query.useYjs as string
</script>
