import { Plugin, PluginKey, type Transaction } from "prosemirror-state"

/**
 * Sets the window title to the current selection for debugging.
 */
export function debugSelection(): Plugin {
	return new Plugin({
		key: new PluginKey("debugSelection"),
		state: {
			init(): void { /**/ },
			apply(tr: Transaction): void {
				document.title = `${tr.selection.from} - ${tr.selection.to}`
			},
		},
	})
}
