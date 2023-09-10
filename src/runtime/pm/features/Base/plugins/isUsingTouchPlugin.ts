import { Plugin, PluginKey } from "@tiptap/pm/state"

import { createStateOnlyPluginApply } from "../../../utils/createStateOnlyPluginApply.js"

export const isUsingTouchPluginKey = new PluginKey<boolean>("isUsingTouchPlugin")
export function isUsingTouchPlugin(): Plugin<boolean> {
	const noClasses = {}
	const attributes = {
		class: "group using-touch"
	}
	return new Plugin({
		key: isUsingTouchPluginKey,
		props: {
			handleDOMEvents: {
				pointerdown: (view, event) => {
					const pluginState = isUsingTouchPluginKey.getState(view.state)
					const isUsingTouch = event.pointerType === "touch"
					if (pluginState !== isUsingTouch) {
						const tr = view.state.tr
						tr.setMeta(isUsingTouchPluginKey, true)
						tr.setMeta("addToHistory", false)
						view.dispatch(tr)
					}
				}
			},
			attributes: state => {
				if (isUsingTouchPluginKey.getState(state)) {
					return attributes
				}
				return noClasses
			}
		},
		state: {
			init() {
				return false
			},
			apply: createStateOnlyPluginApply(isUsingTouchPluginKey)
		}
	})
}
