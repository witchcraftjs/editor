import { type CoreCommands } from "./types.js"


type CommandTypes<TReturn> = {
	[key in keyof CoreCommands<TReturn>]: Record<key, CoreCommands<TReturn>[key]>;
}
 
declare module "@tiptap/core" {
	// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
	interface Commands<ReturnType> extends CommandTypes<ReturnType> {}
}
