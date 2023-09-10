import { Plugin, PluginKey } from "@tiptap/pm/state"

import { createStateOnlyPluginApply } from "../../../utils/createStateOnlyPluginApply.js"

export const isCursorVisiblePluginKey = new PluginKey<boolean>("isCursorVisiblePlugin")
export function isCursorVisiblePlugin(): Plugin<boolean> {
	const noClasses = {}
	const attributes = {
		class: "[caret-color:transparent]"
	}
	return new Plugin<boolean>({
		key: isCursorVisiblePluginKey,
		state: {
			init() {
				return true
			},
			apply: createStateOnlyPluginApply(isCursorVisiblePluginKey)
		},
		props: {
			attributes(state) {
				if (!isCursorVisiblePluginKey.getState(state)) {
					return attributes
				}
				return noClasses
			}
		}
	})
}
