import { delay } from "@alanscodelog/utils/delay"
import type { Editor } from "@tiptap/core"

import { FileInsertHandler } from "./FileInsertHandler.js"

const safeToPreviewTypes = [
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/gif",
	"image/webp",
	"image/bmp",
	"image/x-icon",
	"image/vnd.microsoft.icon",
	"image/apng",
	"image/avif",
	"image/jxl"
	// "image/svg+xml" is UNSAFE to display like this
]

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
		if (safeToPreviewTypes.includes(file.type)) return URL.createObjectURL(file)
	}

	override async saveFile(file: File, id: string, _editor: Editor, previewSrc: string | undefined) {
		// simulating a upload, using Math.random() to simulate different speeds
		await delay(this.delay * Math.random())
		return {
			file,
			attrs: { src: previewSrc ?? "", id: id }
		}
		// a real app might look more like this:
		// const assetId = await save(file, { id: id })
		//
		// return {
		// 	file,
		// 	attrs: {
		// 		id: assetId
		// 	},
		// }
	}

	override onSaveError(file: File, editor: Editor, pos: number | undefined, error: Error, id: string, previewSrc?: string) {
		super.onSaveError(file, editor, pos, error, id, previewSrc)
		if (previewSrc?.startsWith("blob:")) URL.revokeObjectURL(previewSrc)
	}

	// we don't revoke here since the demo sets previewSrc to attrs.src, but if we were to return { ..., previewSrc } in saveFile
	// and note set it to attrs.src more like a real app you'd want to do this:
	// override replacePlaceholder(editor: Editor, pos: number, attrs: Record<string, unknown>, id: string, previewSrc?: string) {
	// 	super.replacePlaceholder(editor, pos, attrs, id, previewSrc)
	// 	if (previewSrc?.startsWith("blob:")) URL.revokeObjectURL(previewSrc)
	// }
}

export const testFileInsertHandler = new TestFileInsertHandler()
