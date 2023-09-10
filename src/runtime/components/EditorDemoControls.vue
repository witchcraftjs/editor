<template>
<div
	class="
		w-full
		flex
		items-stretch
		justify-center
		gap-2
		[&>*]:rounded-sm
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
</template>

<script setup lang="ts">
import WDarkModeSwitcher from "@witchcraft/ui/components/LibDarkModeSwitcher"

import CodeBlockThemePicker from "./CodeBlockThemePicker.vue"

defineProps<{
	codeBlocksThemeList: string[]
}>()
const codeBlocksTheme = defineModel<string>("codeBlocksTheme", { required: true })
</script>
