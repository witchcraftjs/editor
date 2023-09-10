import { type Command, Extension } from "@tiptap/core"
import { type EditorState, Plugin, type PluginKey } from "@tiptap/pm/state"

import { type Menu, menusPluginKey, type OpenMenuInfo } from "./types.js"

import { createStateOnlyPluginObjApply } from "../../utils/createStateOnlyPluginObjApply.js"

declare module "@tiptap/core" {

	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		menus: {
			/** Can be used to close the open menu. Use force to close pinned menus. */
			closeOtherMenus: (forceUnpin?: boolean) => ReturnType
			/** This will temporarily open and "pin" the menu, disabling the auto-prioritizing, until it's closed with `force: true`. */
			pinOpenMenu: (options: Pick<OpenMenuInfo, "name">) => ReturnType
			/**
			 * Register a menu to be hnadled by the Menus extension.
			 *
			 * The ideal place to register them is usually in the onCreate hook of the extension. Do not do it from addProseMirrorPlugins as this will cause the menus to be registered more times than they should be.
			 *
			 * To be technical, this happens because the DocumentApi creates a state using a copy of the editor's plugins from the extension manager. The problem is not the copy but that the plugin property is actually a getter that calls `addProseMirrorPlugins` so the functon must not have side-effects.
			 */
			registerMenu: <TPluginKey extends PluginKey<any>>(menu: Menu<TPluginKey>) => ReturnType
			/**
			 * Since most mark menus don't have a close command, this is can be used to temporarily disable them.
			 *
			 * This should not be used to more permanantly turn off mark menus, as internally this is used to temporarily disable AND enable them. All optional mark menus have options to disable them.
			 */
			disableMarkMenus: () => ReturnType
			/**
			 * Enables showing of mark menus again.
			 */
			enableMarkMenus: () => ReturnType

		}
	}
}

/**
 * Helps coordinate the display of different menus, never allowing more than one to be opened, sorting by priority, and autoclosing others. \*.
 *
 * If this extension is available, extensions with menus will register themselves, some with a higher priority than others.
 *
 * On each transaction, the extension will check in order of priority if any of the registered menus should be opened and save which menu that is to it's `menusPluginKey`, closing other open menus.
 *
 * The MarkMenuManager component is used in the editor wrapper to easily display "mark" menus  with the help of this extension. If it is not used, they won't show since they must be added manually. The commponent reads the saved state and if the menu is a mark menu and a renderer has been provided for it using the `menusInjectionKey`, it renders the menu. The editor wrapper provides the `menus` option which takes care of providing the menus.
 *
 * \* Note that menus may choose to not implement or not provide a close command. In cases like "mark" menus this is fine if using the MarkMenuManager since it will only ever display one menu, but can otherwise break the intended purpose of the extension.
 */

// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-empty-object-type
export const Menus = Extension.create<{}, { menus: Menu[] }>({
	name: "menus",
	addStorage() {
		return {
			menus: []
		}
	},
	addCommands() {
		return {
			enableMarkMenus: (): Command => ({ tr, dispatch }) => {
				if (dispatch) {
					tr.setMeta(menusPluginKey, {
						canShow: true
					})
				}
				return true
			},
			disableMarkMenus: (): Command => ({ tr, dispatch }) => {
				if (dispatch) {
					tr.setMeta(menusPluginKey, {
						canShow: false
					})
				}
				return true
			},

			registerMenu: <TPluginKey extends PluginKey<any>>(menu: Menu<TPluginKey>): Command => () => {
				const menus = this.storage.menus
				const existingIndex = menus.findIndex(m => m.name === menu.name)
				if (existingIndex >= 0) {
					// eslint-disable-next-line no-console
					console.warn("Menu already registered, replacing.", {
						existing: menus[existingIndex],
						new: menu
					})
					menus.splice(existingIndex, 1, menu)
				}
				menus.push(menu)
				menus.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
				return true
			},
			unregisterMenu: (menu: Menu): Command => ({ tr }) => {
				const menus = this.storage.menus
				const index = menus.indexOf(menu)
				if (index !== -1) {
					menus.splice(index, 1)
					tr.setMeta(menusPluginKey, { menus })
					return true
				}
				return false
			},
			pinOpenMenu: (options: Pick<OpenMenuInfo, "name">): Command => ({ dispatch, tr, commands }) => {
				const menus = this.storage.menus
				const menu = menus.find(m => m.name === options.name)
				if (!menu) {
					// eslint-disable-next-line no-console
					console.warn("Menu to open not found.", options)
					return false
				}
				commands.closeOtherMenus(true)
				if (dispatch) {
					tr.setMeta(menusPluginKey, {
						state: true,
						pin: true,
						menu
					})
				}
				return true
			},
			closeOtherMenus: (forceUnpin: boolean = false): Command => ({ dispatch, tr, state, commands }) => {
				const other = menusPluginKey.getState(state)
				if (other?.pin && !forceUnpin) return false
				const otherMenu = other?.menu
				if (otherMenu?.closeCommand) {
					commands[otherMenu.closeCommand]()
					if (dispatch) {
						tr.setMeta(menusPluginKey, {
							state: false,
							menu: undefined
						})
					}
					return true
				}
				return false
			}
		}
	},
	addProseMirrorPlugins() {
		const self = this
		return [
			new Plugin({
				key: menusPluginKey,
				state: {
					init() {
						return {
							state: false,
							pin: false,
							canShow: true
						}
					},
					apply: createStateOnlyPluginObjApply(menusPluginKey)
				},
				appendTransaction(trs, oldState, newState) {
					const menuWasSetByTrs = trs.some(tr => tr.getMeta(menusPluginKey))
					if (menuWasSetByTrs) return undefined
					const menus = self.storage.menus
					const activeMenu = getActiveMenu(menus, newState)
					const value = menusPluginKey.getState(newState)
					const valueWas = menusPluginKey.getState(oldState)
					if (valueWas?.pin) { return undefined }
					if (value?.state !== !!activeMenu || value?.menu?.name !== activeMenu?.name) {
						return newState.tr.setMeta(menusPluginKey, {
							state: !!activeMenu,
							menu: activeMenu
								? {
										name: activeMenu.name,
										type: activeMenu.type,
										closeCommand: activeMenu.closeCommand
									}
								: undefined
						})
					}
					return undefined
				}
			})
		]
	}
})

function getActiveMenu(menus: Menu[] | undefined, state: EditorState): Menu | undefined {
	if (!menus) return undefined
	for (const menu of menus) {
		const menuState = menu.pluginKey.getState(state)
		if (menuState === undefined) {
			// eslint-disable-next-line no-console
			console.warn("Menu plugin state is undefined. Did you register a plugin with this key?", menu.pluginKey, menu.name)
		}
		if (menu.canShow(state, menuState)) {
			return menu
		}
	}
	return undefined
}
