import type { Command } from "@tiptap/core"

import { redirectFromEmbedded } from "../../EmbeddedDocument/utils/redirectFromEmbedded.js"

declare module "@tiptap/core" {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		deleteItem: {
			/**
			 * @redirectable
			 */
			deleteItem: (pos?: number | undefined) => ReturnType
		}
	}
}

export const deleteItem = (type: string) =>
	(pos?: number | undefined): Command =>
		({ view, commands }): boolean => {
			const redirect = redirectFromEmbedded(view, "deleteItem", { args: [pos], view, commands })
			if (redirect.redirected) { return redirect.result as any }

			return commands.deleteNodes(type, pos)
		}
