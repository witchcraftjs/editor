import type { NodeType } from "@tiptap/pm/model"
import { Plugin, PluginKey, type Transaction } from "@tiptap/pm/state"

import type { ItemNodeOptions } from "../types.js"
import { fixBlockIds } from "../utils/fixBlockIds.js"

export const itemBlockIdPluginKey = new PluginKey("itemBlockIdPlugin")

export function itemBlockIdPlugin(
	self: {
		type: NodeType
		options: ItemNodeOptions
	}
): Plugin {
	let fixed = false
	return new Plugin({
		key: itemBlockIdPluginKey,
		/** See {@link DocumentApi} */
		stateInit: (tr: Transaction) => {
			fixed = true
			return fixBlockIds(
				tr,
				self.type,
				self.options.idLength,
				self.options.allowAnyIdLength
			)
		},
		// in case the documentApi isn't being used to load documents
		appendTransaction: (_, _oldState, newState) => {
			if (fixed) return
			fixed = true
			return fixBlockIds(
				newState.tr,
				self.type,
				self.options.idLength,
				self.options.allowAnyIdLength
			)
		}
	})
}
