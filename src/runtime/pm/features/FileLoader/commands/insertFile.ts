import type { Command } from "@tiptap/core"

import { redirectFromEmbedded } from "../../EmbeddedDocument/utils/redirectFromEmbedded.js"
import type { IFileLoaderHandler } from "../types.js"
import { findLoadingNodePos } from "../utils/findLoadingNodePos.js"

declare module "@tiptap/core" {

	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		fileLoader: {
			/**
			 * Insert a file into the editor using the FileLoader extension. The configured {@link IFileLoaderHandler} determines where exactly it's inserted (in an item node after by default).
			 *
			 * You can technically test if this will work with `can` but it's not 100% accurate. We only check if at least one file passes the file filter, not everything else.
			 *
			 * @redirectable
			 */
			// this exists in part because I cannot get e2e tests with drop events to work
			// see the FileLoader tests
			// we also need inserFiles to be redirectable
			insertFile(files: File[], pos?: number): ReturnType
		}
	}
}
export const insertFile = (
	handler: IFileLoaderHandler<any, any>,
	debug: boolean = false
) => (
	files: File[],
	pos?: number
): Command => ({ tr, editor, view, commands, dispatch }): boolean => {
	const redirect = redirectFromEmbedded(view, "insertFile", { args: [files, pos], view, commands })
	if (redirect.redirected) { return redirect.result as any }
	// since the handler can call it's own new transactions
	// if we don't prevent this one, we'll get a mismatched transaction error
	if (dispatch) tr.setMeta("fileLoaderIgnore", true)

	if (!dispatch) {
		return files.some(file => handler.filterFile?.(file) ?? true)
	}
	// insert them in reverse so they show up in the correct order
	void Promise.allSettled(files.reverse().map(async file => {
		// eslint-disable-next-line no-console
		if (debug) console.log(`insertFile for ${file.name}`, file)
		const f = handler.filterFile ? handler.filterFile(file) : file
		if (!f) return

		// eslint-disable-next-line no-console
		if (debug) console.log(`filterFile for ${file.name}`, f)

		const insertPosition = handler.insertPosition(f, editor, pos)

		// eslint-disable-next-line no-console
		if (debug) console.log(`insertPosition for ${file.name}`, insertPosition)
		if (insertPosition === undefined) return

		const insertLoadingNode = handler.insertLoadingNode
		const insertId = insertLoadingNode(f, editor, insertPosition, pos)

		// eslint-disable-next-line no-console
		if (debug) console.log(`insertId for ${file.name}`, insertId)
		if (!insertId) return

		const res = await handler.loadFile?.(f, insertId, editor)

		// eslint-disable-next-line no-console
		if (debug) console.log(`result for ${file.name}`, res)
		if (!res) {
			return handler.onLoadError(f, editor, undefined, new Error("fileLoader returned nothing."), insertId)
		}

		const replacePos = findLoadingNodePos(editor.state, insertId)

		// eslint-disable-next-line no-console
		if (debug) console.log(`replacePos for ${file.name}`, replacePos)
		if (replacePos === undefined) {
			return handler.onLoadError(f, editor, replacePos, new Error("Could not find node to replace."), insertId)
		}

		const replaceRes = handler.replaceLoadingNode(editor, replacePos, res as any, insertId)

		// eslint-disable-next-line no-console
		if (debug) console.log(`called replaceLoadingNode for ${file.name}, replaced node:`, replaceRes)
	})).then(() => {})
	return true
}
