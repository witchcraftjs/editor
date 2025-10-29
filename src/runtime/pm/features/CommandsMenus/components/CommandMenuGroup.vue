<template>
<div
	class="group/command-group"
	@mouseenter="popup!.setReference(el);showSubMenu = true"
	@mouseleave="popup!.setReference(null);showSubMenu = false"
>
	<CommandMenuItem
		:item="item"
		v-extract-root-el="(_: any) => el = _"
	/>
	<WPopup
		:model-value="showSubMenu"
		:preferred-horizontal="['right-most']"
		:preferred-vertical="popupVerticalPositioner"
		:position-modifier="popupPositionModifier"
		:use-backdrop="false"
		ref="popup"
		@update:model-value="showSubMenu = $event"
	>
		<template #popup="{ extractEl }">
			<div
				:ref="extractEl"
				@mouseleave="popup!.setReference(null);showSubMenu = false"
			>
				<CommandMenuList
					:entries="item.variations"
					class="ml-0 mt-0"
					@close="emit('close')"
				/>
			</div>
		</template>
	</WPopup>
</div>
</template>

<script setup lang="ts">
import WPopup from "@witchcraft/ui/components/LibPopup"
import { vExtractRootEl } from "@witchcraft/ui/directives/vExtractRootEl"
import { ref } from "vue"

import CommandMenuItem from "./CommandMenuItem.vue"
import CommandMenuList from "./CommandMenuList.vue"

import type { CommandGroup } from "../types.js"
import { popupPositionModifier } from "../utils/popupPositionModifier.js"
import { popupVerticalPositioner } from "../utils/popupVerticalPositioner.js"

/* const props =  */defineProps<{
	item: CommandGroup
}>()
const el = ref<HTMLDivElement | null>(null)
const showSubMenu = ref(false)
const popup = ref<InstanceType<typeof WPopup>>()

const emit = defineEmits<{
	(e: "close"): void
}>()
</script>
