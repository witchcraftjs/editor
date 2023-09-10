import type { Editor } from "@tiptap/core"
import type { InjectionKey, Ref } from "vue"

import type { HTMLAttributesOptions } from "../../../types/index.js"
import type { Command, CommandGroup } from "../CommandsMenus/types.js"

export interface ItemNodeOptions extends HTMLAttributesOptions {
	types: string[]
	states: StatefulNodeStates
	idLength: number
	/** Allows other id lengths so long as they are valid ids. Defaults to true. */
	allowAnyIdLength: boolean
	/**
	 * If true, the `ensureLastItemIsContentPlugin` is added.
	 *
	 * Defaults to true. The option is available mostly for testing purposes.
	 */
	ensureLastItemIsParagraph: boolean
}
export interface ListNodeOptions extends HTMLAttributesOptions {}

export const statesInjectionKey = Symbol("statesInjectionKey") as InjectionKey<Ref<StatefulNodeStates>>

export type StatefulNodeStateEntry<T extends string = string> = {
	icon: string
	value: T
	/** Whether ariaChecked should be true */
	// todo rename
	isChecked: boolean
	isEnabled: boolean
}
export type StatefulNodeType<
	T extends StatefulNodeStateEntry[] = StatefulNodeStateEntry[],
	TDefault extends T[number]["value"] = T[number]["value"]
> = {
	entries: T
	default: TDefault
}
export type StatefulNodeStates = Record<string, StatefulNodeType>

export type ItemMenuPluginState = {
	opened: boolean
	id?: string
}
export { itemMenuPluginKey } from "./plugins/itemMenuPlugin.js"

export type ItemMenuCommand = Command<
	("$blockId" | "$blockPos" | "$contentPos" | any)[],
	((editor: Editor, context: { blockId?: string, blockPos: number, contentPos: number }) => any[])
>
export type ItemMenuGroup = CommandGroup<never, ItemMenuCommand, true>
