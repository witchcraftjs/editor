import type { Command } from "@tiptap/core"

import { placeholderPluginKey } from "../plugins/placeholderPlugin.js"

declare module "@tiptap/core" {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		updateFilePreviewPlaceholder: {
			/**
			 * Update the preview image of a file insertion placeholder widget.
			 */
			updateFilePreviewPlaceholder: (options: { id: string, preview: string }) => ReturnType
		}
	}
}

export const updateFilePreviewPlaceholder = (_defaultOptions?: object): ((opts: { id: string, preview: string }) => Command) => {
	return (opts): Command => ({ tr }) => {
		tr.setMeta(placeholderPluginKey, {
			update: { id: opts.id, preview: opts.preview }
		})
		tr.setMeta("addToHistory", false)
		return true
	}
}
