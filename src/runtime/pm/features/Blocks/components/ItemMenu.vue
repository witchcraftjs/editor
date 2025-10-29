<template>
<WPopup
	:model-value="menu.opened"
	:preferred-horizontal="['left-most']"
	:preferred-vertical="popupVerticalPositioner"
	:position-modifier="popupPositionModifier"
	ref="popup"
	@update:model-value="!$event && props.editor.commands.closeItemMenu()"
>
	<template #popup="{ extractEl }">
		<div
			:ref="extractEl"
		>
			<CommandsMenuList
				:entries="commandsMenu"
				@close="(props.editor.commands as any).closeItemMenu()"
			/>
		</div>
	</template>
</WPopup>
</template>

<script setup lang="ts">
import { unreachable } from "@alanscodelog/utils/unreachable"
import type { Editor } from "@tiptap/core"
import type { Transaction } from "@tiptap/pm/state"
import WPopup from "@witchcraft/ui/components/LibPopup"
import { computed, provide, ref, toRef, watch } from "vue"

import { defaultItemMenu as commandsMenu } from "./defaultItemMenu.js"

import CommandsMenuList from "../../CommandsMenus/components/CommandMenuList.vue"
import { commandExecuterInjectionKey, menuBlockIdInjectionKey, menuEditorInjectionKey } from "../../CommandsMenus/types.js"
import { popupPositionModifier } from "../../CommandsMenus/utils/popupPositionModifier.js"
import { popupVerticalPositioner } from "../../CommandsMenus/utils/popupVerticalPositioner.js"
import { itemMenuPluginKey, type ItemMenuPluginState } from "../types.js"
import { createItemMenuCommandExecuter } from "../utils/createItemMenuCommandExecuter.js"

const props = defineProps<{
	editor: Editor
}>()

const menu = ref<ItemMenuPluginState>({ opened: false, id: undefined })
const popup = ref<InstanceType<typeof WPopup>>()

const virtualMenuEl = ref<{ getBoundingClientRect(): DOMRect } | null>(null)
function virtualGetBoundingClientRect(): DOMRect {
	// note this will not work if we allow recursive embedding
	const el = props.editor.view.dom.querySelector(`li[blockid='${menu.value.id}']`)
	const handle = el?.parentElement?.querySelector(".grab-handle")

	if (handle instanceof HTMLElement) {
		const rect = handle.getBoundingClientRect()
		return {
			// rect cannot be spread normally, it's properties are not enumerable
			...rect.toJSON(),
			width: 0 // override the width of the item, we want it to be ignored
			// we want to keep the height though, since we want the menu centered to it if possible
		}
	}
	unreachable()
}

function updateState({ editor }: { transaction: Transaction, editor: Editor }): void {
	const was = menu.value
	const willBe = itemMenuPluginKey.getState(editor.state as any) ?? menu.value
	if (willBe.opened && (was.opened !== willBe.opened || was.id !== willBe.id)) {
		virtualMenuEl.value = { getBoundingClientRect: virtualGetBoundingClientRect }
		popup.value!.setReference(virtualMenuEl.value)
	} else if (virtualMenuEl.value && !willBe.opened) {
		virtualMenuEl.value = null
		popup.value!.setReference(virtualMenuEl.value!)
	}
	// we can't open the popup before the virtualMenuEl is set
	menu.value = willBe
}
const editorRef = toRef(props, "editor")
provide(menuEditorInjectionKey, editorRef as any)
const blockId = computed(() => menu.value.id)
provide(menuBlockIdInjectionKey, blockId)
provide(commandExecuterInjectionKey, createItemMenuCommandExecuter(() => blockId.value))
watch(() => props.editor, (newVal, oldVal) => {
	oldVal.off("transaction", updateState)
	newVal.on("transaction", updateState)
})
props.editor.on("transaction", updateState)
</script>
