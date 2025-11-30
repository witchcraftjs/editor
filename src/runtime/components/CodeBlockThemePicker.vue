<!-- todo replace with ui libs search select when implemented -->
<script setup lang="ts">
import WIcon from "@witchcraft/ui/components/Icon"
import {
	ComboboxAnchor,
	ComboboxContent,
	ComboboxInput,
	ComboboxItem,
	ComboboxItemIndicator,
	ComboboxPortal,
	ComboboxRoot,
	ComboboxViewport } from "reka-ui"

import IRadixIconsCheck from "~icons/radix-icons/check"

defineProps<{
	codeBlocksThemeList: string[]
}>()
const codeBlocksTheme = defineModel<string>("codeBlocksTheme", { required: true })
</script>

<template>
<label class="flex items-center gap-2">
	<span>Code Block Theme:</span>

	<ComboboxRoot
		class="relative"
		:open-on-click="true"
		v-model="codeBlocksTheme"
	>
		<ComboboxAnchor
			class="
				flex
				items-center
				justify-between
				rounded-sm
				px-2
				leading-none
				fg-inherit
				bg-inherit
				outlined-within:border-accent-500
				gap-2
			"
		>
			<ComboboxInput
				class="
					bg-inherit
					min-w-[70px]
					w-full
					outline-hidden
					focus-outline
					border-b
					border-accent-400
				"
				placeholder="Placeholder..."
			/>
		</ComboboxAnchor>
		<ComboboxPortal
			to="#root"
		>
			<ComboboxContent
				side="bottom"
				position="popper"
				:avoid-collisions="true"
				:prioritize-position="true"
				class="
					z-100
					w-[var(--reka-combobox-trigger-width)]
					align-end
					bg-white
					dark:bg-neutral-900
					overflow-hidden
					will-change-[opacity,transform]
					data-[side=top]:animate-slideDownAndFade
					data-[side=right]:animate-slideLeftAndFade
					data-[side=bottom]:animate-slideUpAndFade
					data-[side=left]:animate-slideRightAndFade
					border-neutral-500
					dark:border-neutral-700
					border-1
					rounded-sm
					shadow-[0_0_10px_1px]
					shadow-black/30
					max-h-[50vh]
				"
				ref="contentComponent"
			>
				<ComboboxViewport
					class="flex flex-col"
				>
					<ComboboxItem
						:value="option"
						class="
						flex
						justify-between
						gap-2
						px-2
						cursor-pointer
						data-[highlighted]:outline-hidden
						data-[highlighted]:bg-accent-200
						data-[highlighted]:text-accent-800
						dark:data-[highlighted]:bg-accent-800
						dark:data-[highlighted]:text-accent-200
						pl-[25px]
					"
						v-for="option in codeBlocksThemeList"
						:key="option"
					>
						<span>
							{{ option }}
						</span>
						<ComboboxItemIndicator
							class="absolute left-0 w-[25px] inline-flex items-center justify-center"
						>
							<WIcon><i-radix-icons-check/></WIcon>
						</ComboboxItemIndicator>
					</ComboboxItem>
				</ComboboxViewport>
			</ComboboxContent>
		</ComboboxPortal>
	</ComboboxRoot>
</label>
</template>
