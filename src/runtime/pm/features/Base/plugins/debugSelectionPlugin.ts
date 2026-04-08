/* eslint-disable no-console */
import type { Editor } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { Decoration, DecorationSet } from "@tiptap/pm/view"

import { isEmbeddedBlock } from "../../EmbeddedDocument/utils/isEmbeddedBlock.js"

const ROOT_SELECTION_REGEX = /(DEBUG: [0-9 -]*)(\[|$)/
const SUB_SELECTION_REGEX = /(\[[0-9 -]*\])/

export const debugSelectionPluginKey = new PluginKey("debugSelection")

/** Renders a floating tooltip directly above the selection point in dev mode only. */
export const debugSelectionPlugin = (editor: Editor, log: boolean = false): Plugin => {
	let initialized = false
	let currentDisplayString = ""

	return new Plugin({
		key: debugSelectionPluginKey,
		state: {
			init() { return DecorationSet.empty },
			apply(tr, oldSet) {
				if (!import.meta.dev) return oldSet.map(tr.mapping, tr.doc)
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
						// Ensure prefix is present even if starting as an embedded block
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
				} const widget = document.createElement("div")
				Object.assign(widget.style, {
					position: "absolute",
					top: "110%",
					right: "0",
					zIndex: "100",
					padding: "2px 6px",
					fontSize: "10px",
					fontFamily: "monospace",
					color: "white",
					backgroundColor: "rgba(0, 0, 0, 0.7)",
					borderRadius: "2px",
					pointerEvents: "none",
					whiteSpace: "nowrap",
					lineHeight: "1"
				})
				widget.textContent = currentDisplayString

				const deco = Decoration.widget(tr.selection.to, widget, {
					side: -1, // Ensure it stays to the left of the cursor
					key: "debug-selection-tooltip"
				})

				return DecorationSet.create(tr.doc, [deco])
			}
		},
		props: {
			decorations(state) {
				return debugSelectionPluginKey.getState(state)
			}
		}
	})
}
