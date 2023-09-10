import { delay } from "@alanscodelog/utils/delay"
import mime from "mime/lite"

import { FileLoaderHandler } from "./FileLoaderHandler.js"

import { findLoadingNodePos } from "../utils/findLoadingNodePos.js"
import { readAsDataUrl } from "../utils/readAsDataUrl.js"

export const testFileLoaderDelay = 2000
/** Instance of {@link FileLoaderHandler} for testing. */

// eslint-disable-next-line @typescript-eslint/naming-convention
export const TestFileLoaderHandler = new FileLoaderHandler({
	filterFile: file => {
		const mimeExtension = mime.getExtension(file.type)
		if (!mimeExtension) return undefined
		const normalizedMimeType = mime.getType(mimeExtension)
		;(file as any).parsedMime = normalizedMimeType

		if (!normalizedMimeType?.startsWith("image")) return undefined
		return file as File & { parsedMime: string }
	},
	replaceLoadingNode(editor, pos, res) {
		const pm = editor.schema.nodes
		const parsedMime = res.file.parsedMime
		const returnVal = editor.commands.command(({ tr }) => {
			if (parsedMime.startsWith("image")) {
				tr.replaceWith(pos, pos + 1, pm.image.create({
					src: res.result
				}))
				return true
			}
			tr.delete(pos, pos + 1)
			// todo show warning
			return false
		})
		return returnVal
	},
	loadFile: async (file, insertId, editor) => {
		const result = await readAsDataUrl(file)
		const replacePos = findLoadingNodePos(editor.state, insertId)

		// preview the "upload"
		if (replacePos !== undefined) {
			editor.commands.command(({ tr }) => {
				tr.setNodeAttribute(replacePos, "preview", result)
				return true
			})
		}

		if (file.parsedMime.startsWith("image")) {
			// simulating a upload, using Math.random() to simulate different speeds
			await delay(testFileLoaderDelay * Math.random())
			return {
				file,
				result
			}
		}
		return undefined
	}
})
