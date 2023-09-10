import type { PluginKey, Transaction } from "@tiptap/pm/state"

export function createStateOnlyPluginApply<T extends PluginKey<any>>(key: T) {
	return function (tr: Transaction, value: ReturnType<T["getState"]>) {
		const trValue = tr.getMeta(key)
		if (trValue !== undefined) {
			return trValue
		}
		return value
	}
}
