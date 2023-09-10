import { Extension } from "@tiptap/core"

import { deleteNodes } from "./commands/deleteNodes.js"
import { setCursorVisible } from "./commands/setCursorVisible.js"
import { debugSelectionPlugin } from "./plugins/debugSelectionPlugin.js"
import { isCursorVisiblePlugin } from "./plugins/isCursorVisiblePlugin.js"
import { isUsingTouchPlugin } from "./plugins/isUsingTouchPlugin.js"
import { unfocusedSelectionIndicatorPlugin } from "./plugins/unfocusedSelectionIndicatorPlugin.js"
import type { BaseExtensionOptions } from "./types.js"

import { backspace } from "../../commands/backspace.js"
import { changeAttrs } from "../../commands/changeAttrs.js"
import { enter } from "../../commands/enter.js"
import { insertBreak } from "../../commands/insertBreak.js"

/** Adds some basic commands and plugins to the editor. */

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Base = Extension.create<BaseExtensionOptions>({
	name: "Base",
	addProseMirrorPlugins() {
		return [
			debugSelectionPlugin(this.editor),
			unfocusedSelectionIndicatorPlugin(),
			isUsingTouchPlugin(),
			isCursorVisiblePlugin()
		]
	},
	addCommands() {
		return {
			enter: enter(),
			deleteNodes: deleteNodes(),
			insertBreak: insertBreak("codeBlock"),
			backspace: backspace(),
			changeAttrs: changeAttrs(),
			setCursorVisible: setCursorVisible()
		}
	}
})
