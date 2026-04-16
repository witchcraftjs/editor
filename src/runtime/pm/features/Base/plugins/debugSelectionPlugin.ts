/* eslint-disable no-console */
import type { Editor } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"

import { isEmbeddedBlock } from "../../EmbeddedDocument/utils/isEmbeddedBlock.js"

const ROOT_SELECTION_REGEX = /(DEBUG: [0-9 -]*)(\[|$)/
const SUB_SELECTION_REGEX = /(\[[0-9 -]*\])/

export const debugSelectionPluginKey = new PluginKey("debugSelection")
let pluginCount = 0

/** Renders a floating tooltip in the top-right corner of the editor's parent element. */
export const debugSelectionPlugin = (editor: Editor, log: boolean = false): Plugin => {
	let initialized = false
	let currentDisplayString = ""

	const container = document.createElement("div")
	Object.assign(container.style, {
		position: "absolute",
		top: "5px",
		right: "5px",
		zIndex: "10000",
		padding: "2px 6px",
		fontSize: "10px",
		fontFamily: "monospace",
		color: "white",
		backgroundColor: "rgba(0,0,0,0.7)",
		borderRadius: "2px",
		pointerEvents: "none",
		whiteSpace: "nowrap",
		lineHeight: "1",
		display: "none"
	})
	container.id = "debug-selection-widget-" + pluginCount
	pluginCount++

	if (import.meta.dev) {
		editor.view.dom.parentElement?.appendChild(container)
	}

	return new Plugin({
		key: debugSelectionPluginKey,
		state: {
			init() { return null },
			apply(tr, _old) {
				if (!import.meta.dev) return null
				const sel = `${tr.selection.from} - ${tr.selection.to}`

				if (isEmbeddedBlock(editor.view)) {
					if (log) console.log(`embedded selection: ${sel}`)
					const hasEmbeddedSelection = currentDisplayString.match(SUB_SELECTION_REGEX)
					if (hasEmbeddedSelection) {
						currentDisplayString = currentDisplayString.replace(
							SUB_SELECTION_REGEX,
							`[${sel}]`
						)
					} else {
						// ensure prefix is present even if starting as an embedded block
						const prefix = currentDisplayString.startsWith("DEBUG: ") ? "" : "DEBUG: "
						currentDisplayString = `${prefix}${currentDisplayString} [${sel}]`
					}
				} else {
					if (log) console.log(`root selection: ${sel}`)
					if (!initialized) {
						initialized = true
						currentDisplayString = `DEBUG: ${sel}`
					} else {
						currentDisplayString = currentDisplayString.replace(
							ROOT_SELECTION_REGEX,
							`DEBUG: ${sel} $2`
						)
					}
				}

				container.textContent = currentDisplayString
				container.style.display = currentDisplayString ? "block" : "none"

				return null
			}
		},
		view: () => {
			return {
				destroy: () => {
					container.remove()
				}
			}
		}
	})
}
