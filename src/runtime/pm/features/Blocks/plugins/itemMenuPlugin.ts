import { Plugin, PluginKey } from "@tiptap/pm/state"

import { createStateOnlyPluginObjApply } from "../../../utils/createStateOnlyPluginObjApply.js"
import type { ItemMenuPluginState } from "../types.js"

export const itemMenuPluginKey = new PluginKey<ItemMenuPluginState>("item-menu")

export function itemMenuPlugin(): Plugin<ItemMenuPluginState> {
	return new Plugin<ItemMenuPluginState>({
		key: itemMenuPluginKey,
		state: {
			init() {
				return {
					opened: false,
					id: undefined
				}
			},
			apply: createStateOnlyPluginObjApply(itemMenuPluginKey)
		}
	})
}
