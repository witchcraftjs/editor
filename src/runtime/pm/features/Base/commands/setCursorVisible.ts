import type { Command } from "@tiptap/core"

import { isCursorVisiblePluginKey } from "../plugins/isCursorVisiblePlugin.js"

declare module "@tiptap/core" {

	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		setCursorVisible: {
			/**
			 * Set the state of the cursor visibility plugin.
			 */
			setCursorVisible: (val: boolean) => ReturnType
		}
	}
}

export const setCursorVisible = () =>
	(val: boolean): Command => ({ tr, dispatch }) => {
		if (dispatch) {
			tr.setMeta(isCursorVisiblePluginKey, val)
		}
		return true
	}
