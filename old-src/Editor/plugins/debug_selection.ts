import { Plugin, PluginKey } from "prosemirror-state"

/**
 * Sets the window title to the current selection for debugging.
 */
export function debug_selection(): Plugin {
	return new Plugin({
		key: new PluginKey("debug_selection"),
		state: {
			init(): void { return },
			apply(tr): void {
				document.title = `${tr.selection.from} - ${tr.selection.to}`
			},
		},
	})
}
