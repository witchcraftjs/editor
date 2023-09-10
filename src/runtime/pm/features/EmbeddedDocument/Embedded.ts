import { type Command, Extension } from "@tiptap/core"
import { TextSelection } from "@tiptap/pm/state"

import type { EmbeddedDocumentNodeOptions } from "./types.js"

declare module "@tiptap/core" {

	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		embeddedCommandRedirect: {
			embeddedCommandRedirect: (
				commandName: string,
				args: any,
			) => ReturnType
		}
	}
}

/**
	* This is for "internal" use by the embedded editor only.
	*
	* It should not be registered by the root editor or the documentApi.
	*
	* It provides some additional communication between the embedded editor and the root editor.
	*
	* See {@link EmbeddedDocumentNodeOptions.embeddedBlockCommandRedirect} for more info.
	*
	* See also {@link redirectFromEmbedded} for creating redirectable commands.
	*
	* This extension should always be configured with the root editor and the getPos function from the embedded node view.
	*
	*/

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Embedded = Extension.create<EmbeddedDocumentNodeOptions>({
	name: "embedded",
	addOptions() {
		return {
			embeddedBlockCommandRedirect: undefined,
			getPos: undefined as any,
			rootEditor: undefined as any,
			getEmbedId: undefined as any
		}
	},
	addCommands() {
		if (!this.options.rootEditor) {
			throw new Error("Embedded: Extension must be configured with the root editor.")
		}
		if (!this.options.getPos) {
			throw new Error("Embedded: Extension must be configured with the getPos function.")
		}
		if (!this.options.getEmbedId) {
			throw new Error("Embedded: Extension must be configured with the getEmbedId function.")
		}
		const { rootEditor, getPos, getEmbedId } = this.options
		return {
			embeddedCommandRedirect: (
				commandName: string,
				args: any
			): Command => ({ editor, dispatch }) => {
				const embedId = getEmbedId()
				const nodePos = getPos()
				if (this.options.embeddedBlockCommandRedirect) {
					const res = this.options.embeddedBlockCommandRedirect(commandName, args, { editor, rootEditor, nodePos, embedId, dispatch })
					if (res !== undefined) return res
				}
				switch (commandName) {
					case "insertFile":
						return rootEditor.commands.insertFile(args[0], nodePos)
					case "splitItem":
						if (!nodePos) return false
						return rootEditor.commands.command(({ tr, commands, state, dispatch }) => {
							const from = nodePos
							const schema = state.schema
							if (schema.nodes.item) {
								if (!dispatch) return true
								const node = schema.nodes.item.createAndFill()
								if (!node) return false
								tr.insert(from + 1, node)
								tr.setSelection(TextSelection.create(tr.doc, from + 3))
								commands.focus()
								return true
							}
							return false
						})
					case "indentItem":
						if (!nodePos) return false
						return rootEditor.commands.command(() => {
							rootEditor.commands.indentItem(nodePos)
							rootEditor.commands.setNodeSelection(nodePos + 2)
							return true
						})
					case "unindentItem":
						if (!nodePos) return false
						return rootEditor.commands.command(() => {
							rootEditor.commands.unindentItem(nodePos)
							rootEditor.commands.setNodeSelection(nodePos - 2)
							return true
						})
					default:

						// eslint-disable-next-line no-console
						console.warn(`No redirect handler found for command ${commandName}`)
						break
				}
				return false
			}
		}
	}
})
