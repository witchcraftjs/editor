import { castType } from "@alanscodelog/utils/castType"
import type { Editor } from "@tiptap/core"

import type { ItemMenuCommand } from "../../Blocks/types.js"
import type { Command } from "../types.js"

export function defaultCommandExecuter(
	item: Command,
	editor: Editor
): void {
	if (item.type === "command") {
		const args = typeof item.args === "function"
			? item.args(editor)
			: item.args ?? []
		editor!.commands
			.command(({ commands }) => {
				castType<ItemMenuCommand>(item)
				;(commands as any)[(item).command!](...args)
				return true
			})
	}
}
