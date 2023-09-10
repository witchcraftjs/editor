import type { ChainedCommands, Editor } from "@tiptap/core"
import { type EditorState, PluginKey } from "@tiptap/pm/state"
import type { FunctionalComponent, InjectionKey, Ref } from "vue"

export interface CommandBarExtensionOptions {
	commandBar: CommandBarMenu
}

export type Command<
	TRegularArgs extends any[] = any[],
	TFuncArgs extends	((editor: Editor, ...args: any[]) => any[]) = ((editor: Editor, ...args: any[]) => any[])
> = {
	type: "command"
	command: keyof ChainedCommands
	title: string
	description?: string
	icon?: (new () => any) | FunctionalComponent | { component: (new () => any) | FunctionalComponent, props?: Record<string, any> }
	/**
	 * Args to pass to the command.
	 *
	 * A function to determine those args can also be
	 * passed instead.
	 *
	 * What context is provided to the function depends on the meny.
	 */
	args?: TRegularArgs | TFuncArgs
	/**
	 * Determines whether the entry should be shown.
	 *
	 * Note that while one can just use tiptap's `can()` method, some commands are
	 * expensive to execute, so it's better to just do a more generic lightweight check in those situations.
	 */
	canShow?: (editorstate: EditorState) => boolean
}
export type CommandGroup<
	T extends string | never = string,
	TCommand extends Command<any> = Command<any>,
	TNestable extends boolean = false
> = {
	icon?: (new () => any) | { component: new () => any, props?: Record<string, any> }
	type: "group"
	groupType?: T extends string ? T : never
	title: string
	variations: TNestable extends false ? TCommand[] : (TCommand | CommandGroup<T, TCommand, TNestable>)[]
}
export const menuEditorInjectionKey = Symbol("menuEditorInjectionKey") as InjectionKey<Ref<Editor>>
export const menuBlockIdInjectionKey = Symbol("menuBlockIdInjectionKey") as InjectionKey<Ref<string | undefined>>

export type CommandBarMenuState = {
	state: boolean
	/** For internal use, the commandBar can't be opened if the editor isn't focused. */
	canOpen: boolean
}
export const commandBarMenuPluginKey = new PluginKey<CommandBarMenuState>("commandBarMenuPluginKey")

export type CommandBarCommand = Command
export type CommandBarGroup = CommandGroup<
	"inline", /* todo | "dropdown" */
	CommandBarCommand,
	false
>

export type CommandBarMenu = {
	enabled: true | false | Record<string, boolean>
	commands: (CommandBarCommand | CommandBarGroup)[]
	options?: {
		onlyOpenOnSelection?: boolean
	}
}

export type CommandExecuter = (item: Command, editor: Editor) => void

export const commandExecuterInjectionKey = Symbol("commandExecuterInjectionKey") as InjectionKey<CommandExecuter>
