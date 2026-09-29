import { Extension } from "@tiptap/core"

// note: to keep command augmentation working
export * from "./commands/convertTrForInstanceAndDispatch.js"
export * from "./commands/deleteNodes.js"
export * from "./commands/setCursorVisible.js"
import { convertTrForInstanceAndDispatch } from "./commands/convertTrForInstanceAndDispatch.js"
import { deleteNodes } from "./commands/deleteNodes.js"
import { setCursorVisible } from "./commands/setCursorVisible.js"
import { debugSelectionPlugin } from "./plugins/debugSelectionPlugin.js"
import { isCursorVisiblePlugin } from "./plugins/isCursorVisiblePlugin.js"
import { isUsingTouchPlugin } from "./plugins/isUsingTouchPlugin.js"
import { unfocusedSelectionIndicatorPlugin } from "./plugins/unfocusedSelectionIndicatorPlugin.js"
import type { BaseExtensionOptions } from "./types.js"

// note: to keep command augmentation working
export * from "../../commands/backspace.js"
export * from "../../commands/changeAttrs.js"
export * from "../../commands/enter.js"
export * from "../../commands/insertBreak.js"
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
			setCursorVisible: setCursorVisible(),
			convertTrForInstanceAndDispatch: convertTrForInstanceAndDispatch()
		}
	}
})
