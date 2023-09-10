import { unreachable } from "@alanscodelog/utils"
import type { Command } from "@tiptap/core"

import { findUpwards } from "../../../utils/findUpwards.js"
import { itemMenuPluginKey } from "../types.js"

declare module "@tiptap/core" {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		itemMenu: {
			openItemMenu: (id?: string) => ReturnType
			closeItemMenu: (id?: string) => ReturnType
			toggleItemMenu: (id?: string) => ReturnType
		}
	}
}

declare module "../../../../types/index.js" {
	interface MenuCloseCommands {
		closeItemMenu: "closeItemMenu"
	}
}

export const openItemMenu = (itemTypeName: string) =>
	(id?: string): Command =>
		({ tr, state, dispatch }) => {
			const menu = itemMenuPluginKey.getState(state)
			id ??= findUpwards(
				tr.doc,
				state.selection.map(tr.doc, tr.mapping).from,
				$pos => {
					if ($pos.node().type.name === itemTypeName) return true
					return false
				}
			).$pos?.node().attrs.blockId
			if (!id) { unreachable() }
			if (menu?.opened && menu.id === id) return false
			if (dispatch) {
				tr.setMeta("addToHistory", false)

				tr.setMeta(itemMenuPluginKey, { opened: true, id })
			}
			return true
		}

export const closeItemMenu = () => (): Command => ({ tr, state, dispatch }) => {
	const menu = itemMenuPluginKey.getState(state)
	if (menu && !menu.opened) return false
	if (dispatch) {
		tr.setMeta("addToHistory", false)
		tr.setMeta(itemMenuPluginKey, { opened: false, id: undefined })
	}
	return true
}
export const toggleItemMenu = () => (id?: string): Command => ({ commands, state }) => {
	const menu = itemMenuPluginKey.getState(state)
	if (menu?.opened) {
		return commands.closeItemMenu()
	} else {
		return commands.openItemMenu(id)
	}
}
