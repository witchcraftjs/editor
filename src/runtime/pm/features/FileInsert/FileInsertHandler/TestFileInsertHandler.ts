import { delay } from "@alanscodelog/utils/delay"
import type { Editor } from "@tiptap/core"

import { FileInsertHandler } from "./FileInsertHandler.js"

import { findPlaceholder, placeholderPluginKey } from "../plugins/placeholderPlugin.js"
import { readAsDataUrl } from "../utils/readAsDataUrl.js"

/**
 * Test-specific file inserter handler.
 *
 * Simulates async file uploading with a configurable max delay and preview support.
 */

export class TestFileInsertHandler extends FileInsertHandler {
	/**
	 * Max* delay in ms applied before resolving a file upload (useful for testing), the delay itself is randomized.
	 *
	 * @default 2000
	 */
	delay: number

	constructor({ delay = 2000 }: { delay?: number } = {}) {
		super()
		this.delay = delay
	}

	override async saveFile(file: File, insertId: string, editor: Editor) {
		const result = await readAsDataUrl(file)

		const replacePos = findPlaceholder(editor.state, insertId)
		if (replacePos !== null && !editor.isDestroyed) {
			editor.commands.command(({ tr }) => {
				tr.setMeta("addToHistory", false)
				tr.setMeta(placeholderPluginKey, {
					update: { id: insertId, preview: result }
				})
				return true
			})
		}

		// simulating a upload, using Math.random() to simulate different speeds
		await delay(this.delay * Math.random())
		return {
			file,
			result
		}
	}
}

export const testFileInsertHandler = new TestFileInsertHandler()
