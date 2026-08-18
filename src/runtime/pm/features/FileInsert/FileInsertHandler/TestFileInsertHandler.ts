import { delay } from "@alanscodelog/utils/delay"
import type { Editor } from "@tiptap/core"

import { FileInsertHandler } from "./FileInsertHandler.js"

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

	override async generatePreview(file: File, _id: string, _editor: Editor) {
		return readAsDataUrl(file)
	}

	override async saveFile(file: File, id: string, _editor: Editor, previewSrc: string | undefined) {
		// simulating a upload, using Math.random() to simulate different speeds
		await delay(this.delay * Math.random())
		return {
			file,
			attrs: { src: previewSrc ?? "", id: id }
		}
	}
}

export const testFileInsertHandler = new TestFileInsertHandler()
