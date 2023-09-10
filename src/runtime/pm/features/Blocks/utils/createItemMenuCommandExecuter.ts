import { castType } from "@alanscodelog/utils/castType"
import { unreachable } from "@alanscodelog/utils/unreachable"
import type { Editor } from "@tiptap/core"

import type { ItemMenuCommand } from "../types.js"

export function createItemMenuCommandExecuter(
	getBlockId: () => string | undefined

) {
	return function itemMenuCommandExecuter(
		item: ItemMenuCommand,
		editor: Editor
	): void {
		const blockId = getBlockId()

		if (blockId === undefined) {
			// eslint-disable-next-line no-console
			console.warn("No blockId found, this is probably a bug.")
			return
		}
		if (item.type === "command") {
			const blockEl = editor!.view.dom.querySelector(`li[blockid='${blockId}']`)

			const blockPos = editor!.view.posAtDOM(blockEl!, 0)
			if (blockId !== undefined && blockPos <= -1) unreachable()

			const args = typeof item.args === "function"
				? item.args(editor, { blockId, blockPos, contentPos: blockPos + 1 })
				: item.args?.map((arg: any) =>
					arg === "$blockId"
						? blockId
						: arg === "$blockPos"
							? blockPos
							: arg === "$contentPos"
								? blockPos + 1
								: arg
				) ?? []
			editor!.commands
				.command(({ commands }) => {
					castType<ItemMenuCommand>(item)
					;(commands as any)[(item).command!](...args)
					return true
				})
		}
	}
}
