/* eslint-disable no-console */
import type { Editor } from "@tiptap/core"
import { Plugin, PluginKey, type Transaction } from "@tiptap/pm/state"

import { isEmbeddedBlock } from "../../EmbeddedDocument/utils/isEmbeddedBlock.js"

const ROOT_SELECTION_REGEX = /([0-9 -]*)(\[|$)/
const SUB_SELECTION_REGEX = /(\[[0-9 -]*\])/

export const debugSelectionPluginKey = new PluginKey("debugSelection")
/**
 * Sets the window title to the current selection for debugging in development mode (by checking process.env.NODE_ENV).
 *
 * For embedded editors, adds the selection as `[from - to]`.
 */
export const debugSelectionPlugin = (editor: Editor, log: boolean = false): Plugin => {
	let initialized = false
	return new Plugin({
		key: debugSelectionPluginKey,
		state: {
			init(): void { /**/ },
			apply(tr: Transaction): void {
				if (process.env.NODE_ENV === "production") { return }
				const sel = `${tr.selection.from} - ${tr.selection.to}`
				if (isEmbeddedBlock(editor.view)) {
					if (log) {
						console.log(`embedded selection: ${tr.selection.from} - ${tr.selection.to}`)
					}
					const hasEmbeddedSelection = document.title.match(SUB_SELECTION_REGEX)
					if (hasEmbeddedSelection) {
						document.title = document.title
							.replace(
								SUB_SELECTION_REGEX,
								`[${sel}]`
							)
					} else {
						document.title = `${document.title} [${sel}]`
					}
				} else {
					if (log) {
						console.log(`root selection: ${tr.selection.from} - ${tr.selection.to}`)
					}

					if (!initialized) {
						initialized = true
						document.title = sel
					} else {
						document.title = document.title.replace(
							ROOT_SELECTION_REGEX,
							`${sel} $2`
						)
					}
				}
			}
		}
	})
}
