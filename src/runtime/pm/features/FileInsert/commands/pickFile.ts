import { browserUploadFile } from "@alanscodelog/utils/browserUploadFile"
import type { Command } from "@tiptap/core"

import type { FileInputOptions } from "../types.js"

declare module "@tiptap/core" {

	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		pickFile: {
			/**
			 * Open the file picker dialog.
			 *
			 * Accept types and multiple selection are configured at extension registration time.
			 * Pass {@link FileInputOptions} to override them at call time.
			 */
			pickFile: (options?: FileInputOptions) => ReturnType
		}
	}
}
export const pickFile = (defaultOptions: FileInputOptions): ((opts?: FileInputOptions) => Command) => {
	return ({
		acceptTypes = defaultOptions.acceptTypes,
		multiple = defaultOptions.multiple ?? false
	}: FileInputOptions = {}): Command => ({ editor }) => {
		// tiptap doesn't support async commands
		// https://github.com/ueberdosis/tiptap/discussions/4825
		;(async () => {
			const files = await browserUploadFile({
				types: acceptTypes,
				multiple
			})
			editor.chain().command(({ editor }) => {
				return editor.commands.insertFiles(files)
			})
		})()
		return true
	}
}
