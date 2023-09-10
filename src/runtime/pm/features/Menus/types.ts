import type { Editor } from "@tiptap/core"
import { type EditorState, PluginKey } from "@tiptap/pm/state"
import type { Component, InjectionKey, Ref } from "vue"

export interface MenuCloseCommands {
}
/**
 * Menus describe how to close them again with this key.
 *
 * It can be used by other menus to close any open menus before opening itself (see {@link closeOtherMenus}).
 *
 * The close command must not need to take any arguments.
 *
 * You can extend the `MenuCloseCommands` interface to add more commands.
 */

export const menusPluginKey = new PluginKey<MenusPluginState>("menus")
export type MenusPluginState = {
	state: boolean
	menu?: OpenMenuInfo
	pin: boolean
	canShow: boolean
}

export interface BaseMenu<
	T extends PluginKey<any> | undefined = PluginKey<any> | undefined
> {
	name: string
	closeCommand: keyof MenuCloseCommands | undefined
	type: "context" | "floating" | "mark"
	pluginKey: T extends PluginKey<any> ? T : never
	priority?: number
	canShow: T extends PluginKey<any> ? (state: EditorState, pluginState: ReturnType<T["getState"]>) => boolean : never
}
export type OpenMenuInfo = Omit<BaseMenu, "pluginKey" | "canShow">
export interface ContextMenu<
	T extends PluginKey<any> | undefined = PluginKey<any> | undefined
> extends BaseMenu<T> {
	type: "context"
}
export interface FloatingMenu<
	T extends PluginKey<any> | undefined = PluginKey<any> | undefined
> extends BaseMenu<T> {
	type: "floating"
}
export interface MarkMenu<
	T extends PluginKey<any> = PluginKey<any>
> extends BaseMenu<T> {
	type: "mark"
}
export type Menu<T extends PluginKey<any> = PluginKey<any>> = MarkMenu<T> | FloatingMenu<T> | ContextMenu<T>

export type MenuRenderInfo = {
	props?: (editor: Editor) => Record<string, any>
	component: Component
	popupOptions?: {
		/**
		 * Attempts to pin the mark menu to the top of the item if the cursor is this close or less to it. Set to a number greater than zero or return a number greater than 0 to enable it.
		 */
		pinToItemDistance?: number | ((state: EditorState) => number)
	}
}

export const menusInjectionKey = Symbol("menusInjectionKey") as InjectionKey<(Ref<Record<string, MenuRenderInfo>>)>
