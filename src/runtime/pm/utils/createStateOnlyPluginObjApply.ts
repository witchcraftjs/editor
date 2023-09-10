import type { PluginKey, Transaction } from "@tiptap/pm/state"

export function createStateOnlyPluginObjApply<T extends PluginKey<any>>(key: T) {
	return function (tr: Transaction, value: ReturnType<T["getState"]>) {
		const trValue = tr.getMeta(key)
		if (trValue) {
			const newVal = {
				...value,
				...trValue
			}
			return newVal
		} else {
			return value
		}
	}
}
