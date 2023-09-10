import type { SingleCommands } from "@tiptap/core"
import type { EditorView } from "@tiptap/pm/view"

import { isEmbeddedBlock } from "./isEmbeddedBlock.js"

/**
 * Commands that can split a block or modify it's position (indent/unindent) should not be called when the editor is in embedded block mode.
 *
 * This takes care of redirecting the command if possible (see {@link WithOnTriggerByEmbeddedBlockOptions.onTriggerByEmbeddedBlock}), otherwise it logs a warning.
 *
 * If the command should not be called at all and offers no redirect, don't pass the redirect parameter and it will log a different warning.
 *
 * You can use it in a command like this:
 *
 * ```ts
 * commandName: (arg:any) => ({ commands, view, dispatch  }) => {
 *		const redirect = isEmbeddedBlock(view, "commandName", { args:[arg], view, commands, dispatch }))
 * 	if (redirect.redirected) { return redirect.result }
 * }
 *  ```
 */
export function redirectFromEmbedded(
	view: EditorView,
	name: string,
	redirect?: {
		args: any[]
		view: EditorView
		commands: SingleCommands
	}
): { redirected: true, result: any } | { redirected: false } {
	if (isEmbeddedBlock(view)) {
		if (redirect && "embeddedCommandRedirect" in redirect.commands) {
			const result = redirect.commands.embeddedCommandRedirect(
				name,
				redirect.args
			)
			return { redirected: true, result }
		}

		// eslint-disable-next-line no-console
		console.warn(redirect
			? `Command ${name} called from an embedded editor. This command supports command redirection, but no "embeddedCommandRedirect" command found. Command ignored (returning true to prevent further action).`
			: `Command ${name} should not be called from an embedded editor. Command ignored (returning true to prevent further action).`
		)
		return { redirected: true, result: true }
	}
	return { redirected: false }
}
