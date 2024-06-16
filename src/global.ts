import { type rawCommands } from "./pm/commands/index.js"
import { type CoreCommands } from "./types.js"

// tip tap requires command definitions to be in the form {name: {name: Command}}
type WrapIndividualKey<T> = {
	[key in keyof T]: Record<key, T[key]>;
}
 
declare module "@tiptap/core" {
	// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
	interface Commands<ReturnType> extends WrapIndividualKey< CoreCommands<typeof rawCommands, ReturnType>> {}
}
