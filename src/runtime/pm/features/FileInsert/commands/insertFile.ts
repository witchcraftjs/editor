import type { Command } from "@tiptap/core"

import { redirectFromEmbedded } from "../../EmbeddedDocument/utils/redirectFromEmbedded.js"
import type { IFileInsertHandler } from "../types.js"

declare module "@tiptap/core" {

	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		fileInserter: {
			/**
			 * Insert files into the editor using the FileInsert extension. The configured {@link IFileInsertHandler} determines where exactly it's inserted.
			 *
			 * You can technically test if this will work with `can` but it's not 100% accurate. We only check if at least one file passes the file filter, not everything else.
			 *
			 * @redirectable
			 */
			// this exists in part because I cannot get e2e tests with drop events to work
			// see the FileInsert tests
			// we also need inserFiles to be redirectable
			insertFiles(files: File[], pos?: number): ReturnType
		}
	}
}
export const insertFiles = (
	handler: IFileInsertHandler<any, any>
) => (
	files: File[],
	pos?: number
): Command => ({ tr, editor, view, commands, dispatch }): boolean => {
	const redirect = redirectFromEmbedded(view, "insertFile", { args: [files, pos], view, commands })
	if (redirect.redirected) { return redirect.result as any }

	// since the handler can call its own new transactions
	// if we don't prevent this one, we'll get a mismatched transaction error
	if (dispatch) tr.setMeta("fileInserterIgnore", true)

	if (!dispatch) {
		return files.some(file => handler.filterFile?.(file) ?? true)
	}

	// delegate entire lifecycle to handler
	void handler.insertFiles(files, editor, pos)
	return true
}
