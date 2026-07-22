import { browserUploadFile } from "@alanscodelog/utils/browserUploadFile"
import type { Command } from "@tiptap/core"

declare module "@tiptap/core" {

	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		pickImage: {
			pickImage: () => ReturnType
		}
	}
}

export const pickImage = () => (pos?: number, options: Parameters<typeof browserUploadFile>[0] = {}): Command =>
	({ editor }) => {
		// tiptap doesn't support async commands
		// https://github.com/ueberdosis/tiptap/discussions/4825
		;(async () => {
			const files = await browserUploadFile(options)
			editor.chain().command(({ editor }) => {
				return editor.commands.insertFile(files, pos)
			})
		})()
		return true
	}

