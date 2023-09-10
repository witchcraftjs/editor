import { type Command, Extension } from "@tiptap/core"
import { NodeSelection, Plugin } from "@tiptap/pm/state"

import { defaultCommandBarMenuItems } from "./commandBarMenuItems.js"
import { type CommandBarExtensionOptions, commandBarMenuPluginKey, type CommandBarMenuState } from "./types.js"
import { findCommand } from "./utils/findCommand.js"

import { createStateOnlyPluginObjApply } from "../../utils/createStateOnlyPluginObjApply.js"

declare module "@tiptap/core" {

	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		commandBar: {
			/**
			 * Enables the commandBar.
			 */
			enableCommandBar: () => ReturnType
			/**
			 * Closes the commandBar.
			 *
			 * The commandBar has no close command, it can only be enabled or disabled.
			 */
			disableCommandBar: () => ReturnType
		}
	}
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const CommandBar = Extension.create<CommandBarExtensionOptions>({
	name: "commandBar",
	addOptions() {
		return {
			commandBar: defaultCommandBarMenuItems
		}
	},
	addCommands() {
		return {
			enableCommandBar: (): Command => ({ tr, dispatch }) => {
				if (dispatch) {
					this.options.commandBar.enabled = true
					tr.setMeta(commandBarMenuPluginKey, { canOpen: true })
					tr.setMeta("addToHistory", false)
				}
				return true
			},
			disableCommandBar: (): Command => ({ tr, dispatch }) => {
				if (dispatch) {
					this.options.commandBar.enabled = false
					tr.setMeta(commandBarMenuPluginKey, { canOpen: false })
					tr.setMeta("addToHistory", false)
				}
				return true
			}
		}
	},
	onCreate() {
		if ("registerMenu" in this.editor.commands) {
			this.editor.commands.registerMenu({
				type: "mark",
				closeCommand: undefined,
				name: "commandBar",
				pluginKey: commandBarMenuPluginKey,
				canShow: (_state, pluginState) => !!pluginState?.state && !!pluginState?.canOpen
			})
		}
	},
	addProseMirrorPlugins() {
		const self = this
		return [
			new Plugin<CommandBarMenuState>({
				key: commandBarMenuPluginKey,
				state: {
					init() {
						return {
							state: true,
							canOpen:
								self.options.commandBar.enabled
								&& (
									document.activeElement === self.editor.view.dom
									|| self.editor.view.dom.contains(document.activeElement)
								)
						}
					},
					apply: createStateOnlyPluginObjApply(commandBarMenuPluginKey)
				},
				props: {
					handleDOMEvents: {
						blur() {
							self.editor.commands.command(({ tr }) => {
								tr.setMeta("addToHistory", false)
								tr.setMeta(commandBarMenuPluginKey, { canOpen: false })
								return true
							})
						},
						focus() {
							self.editor.commands.command(({ tr }) => {
								tr.setMeta("addToHistory", false)
								tr.setMeta(commandBarMenuPluginKey, { canOpen: true })
								return true
							})
						}
					}
				},
				appendTransaction(_trs, oldState, newState) {
					const wasOpened = commandBarMenuPluginKey.getState(oldState)?.state ?? false
					const selection = newState.selection
					const isNodeSelection = selection instanceof NodeSelection
					if ((!wasOpened && isNodeSelection)) return undefined

					const tr = newState.tr

					const commandBarCanShow = self.options.commandBar.options?.onlyOpenOnSelection === true
						? !selection.empty
						: true

					const canShow = findCommand(self.options.commandBar.commands, command => {
						const res = command.canShow?.(newState)
						if (res === true || res === undefined) return true
						return false
					})
					tr.setMeta(commandBarMenuPluginKey, {
						state: !isNodeSelection && commandBarCanShow && canShow
					})
					return tr
				}
			})
		]
	}
})
