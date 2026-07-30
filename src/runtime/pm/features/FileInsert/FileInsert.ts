import { Extension } from "@tiptap/core"
import { Plugin } from "@tiptap/pm/state"
import type { EditorView } from "@tiptap/pm/view"

import { insertFiles } from "./commands/insertFile.js"
import { pickFile } from "./commands/pickFile.js"
import { placeholderPlugin } from "./plugins/placeholderPlugin.js"
import type { FileInsertExtensionOptions } from "./types.js"

/**
 * Provides a way to asynchronously insert files into the editor using decoration-based placeholders.
 *
 * An {@link IFileInsertHandler} interface should be passed to describe what to do with the file at each step.
 * There is a default implementation at {@link FileInsertHandler} that tries to handle as much as possible.
 *
 */

// eslint-disable-next-line @typescript-eslint/naming-convention
export const FileInsert = Extension.create<FileInsertExtensionOptions>({
	name: "fileInserter",

	addOptions() {
		return {
			handler: undefined as any,
			embeddedBlockCommandRedirect: undefined,
			HTMLAttributes: {},
			acceptTypes: [
				{
					description: "Images",
					accept: {
						"image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp"]
					}
				}
			],
			multiple: false
		}
	},

	addCommands() {
		if (!this.options.handler) {
			throw new Error("The FileInsert needs to be configered with a handler (see FileInsertHandler).")
		}

		const self = this
		return {
			insertFiles: insertFiles(self.options.handler),
			pickFile: pickFile({
				acceptTypes: self.options.acceptTypes,
				multiple: self.options.multiple
			})
		}
	},

	addKeyboardShortcuts() {
		return {
			...(import.meta.dev
				? {
						[`Ctrl-Shift-u`]: () => this.editor.commands.pickFile()
					}
				: {})
		}
	},

	addProseMirrorPlugins() {
		const editor = this.editor

		return [
			placeholderPlugin(),
			new Plugin({
				filterTransaction(tr, _state) {
					if (tr.getMeta("fileInserterIgnore")) {
						return false
					}
					return true
				}
			}),
			new Plugin({
				props: {
					handleDrop(
						_view: EditorView,
						event: DragEvent,
						_slice: any,
						moved: boolean
					) {
						if (moved) return false
						const files = Array.from(event.dataTransfer?.files ?? [])
						if (files.length === 0) return false
						event.preventDefault()
						const pos = _view.posAtCoords({ left: event.clientX, top: event.clientY })
						if (!pos) return true
						const resolvedPos = _view.state.doc.resolve(pos.pos)
						const position = resolvedPos.parent.inlineContent
							? pos.pos - 1
							: (pos.inside > 0 ? pos.inside : pos.pos - 1)
						void editor.commands.insertFiles(files, position)
						return true
					},
					handleDOMEvents: {
						paste: (_view, event) => {
							const files = Array.from(event.clipboardData?.files ?? [])
							const htmlContent = event.clipboardData?.getData("text/html")
							if (htmlContent) return
							void editor.commands.insertFiles(files)
						}
					}
				}
			})
		]
	}
})

export type FileInsertExtensionName = "fileInserter"

