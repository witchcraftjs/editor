import type { Editor } from "@tiptap/core"

import type { HTMLAttributesOptions } from "../../../types/index.js"
import type { WithOnTriggerByEmbeddedBlockOptions } from "../EmbeddedDocument/types.js"

/** Options for the pickFile command. Pass at registration time or override at call time. */
export interface FileInputOptions {
	/**
	 * Allowed file types for the file picker dialog.
	 *
	 * Follows the File System Access API structure.
	 *
	 * If passed to FileInsert, sets the defaults for the pickFile command.
	 *
	 * @default [{ description: "Images", accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp"] } }]
	 */
	acceptTypes?: { description?: string, accept: Record<string, string[]> }[]
	/**
	 * Allow multiple file selection in the picker.
	 *
	 * @default false
	 */
	multiple?: boolean
}

export interface FileInsertExtensionOptions extends HTMLAttributesOptions, WithOnTriggerByEmbeddedBlockOptions, FileInputOptions {
	/** See {@link IFileInsertHandler} */
	handler: IFileInsertHandler<File, any>
}

/**
 * Helps handle the saving/uploading of files. Provides a way to adjust the insert position and takes care of keeping track of uploading/saving vs uploaded/saved files.
 *
 * See {@link FileInsertHandler} for a partial implementation you can customize to create the interface.
 */

// eslint-disable-next-line @typescript-eslint/naming-convention
export type IFileInsertHandler<
	TFile extends File,
	T = { file: TFile, result: string | ArrayBuffer | null },
	TKey = string
> = {
	/**
	 * Should handle the entire file insertion lifecycle: filter, insert placeholders,
	 * save files concurrently, replace placeholders.
	 *
	 * See the default implementation as this requires special care if you allow dropping multiple files at once.
	 *
	 * Because widgets are 0 width and we can have multiple widgets in the same position, we cannot use a widget's position to replace nodes if you want to preserve order.
	 *
	 * For example, suppose we drop 10 files at once producing:
	 *
	 * ```
	 * some text [...widgets at position 10]
	 *           ^10
	 * ```
	 *
	 * Now the last file loads first and we replace it:
	 * ```
	 * some text [file 10][...widgets at position 11]
	 * ```
	 *
	 * Next file will not be inserted at the correct position now ever and the widget order does not help us.
	 *
	 * The default implementation handles this by tracking the ids of the files it inserted, their positions for each insert "batch" internally, and searching outwards from the placeholder position to find the right insertion point.
	 */
	insertFiles: (files: File[], editor: Editor, pos?: number) => Promise<void>
	/**
	 * Should load/save/upload the file and return the information necessary to create the uploaded node.
	 *
	 * The `id` and `editor` are provided in case you're uploading the file or doing some other heavy operation and want to update the placeholder as soon as you can upload the file.
	 */
	saveFile: (file: TFile, id: TKey, editor: Editor) => Promise<T | undefined>
	/**
	 * This can be used to remove the placeholder on errors.
	 */
	onSaveError: (
		file: TFile,
		editor: Editor,
		pos: number | undefined,
		error: Error,
		loadingKey: TKey
	) => void

	/**
	 * Where to insert the placeholder.
	 *
	 * If no position is returned, no node should be inserted.
	 */
	insertPosition: (file: TFile, editor: Editor, pos?: number) => number | undefined
	/**
	 * Given a file, should add a placeholder decoration with the `id` set to a unique key. It should return this key if it added the placeholder.
	 *
	 * Using the file name is not a good idea as it's not guaranteed to be unique if the user inserts the same item twice.
	 */
	insertAsyncPlaceholder: (file: TFile, editor: Editor, insertPos: number, originalPos?: number) => TKey | undefined
	/**
	 * After saving/uploading the file, if it's successful, this is passed the result and the position of the placeholder.
	 *
	 * Replace the placeholder with the final node (e.g. an image) and remove the decoration.
	 *
	 * Note this can require special logic if you allow dropping multiple files at once. See {@link IFileInsertHandler.insertFiles}
	 */
	replacePlaceholder: (
		editor: Editor,
		pos: number,
		res: T,
		loadingKey: TKey
	) => void
	/**
	 * Return the file (or whatever type you'd like) to allow the extension to handle it.
	 *
	 * If the function doesn't return anything, the file will be ignored.
	 * No placeholder will be created. The event will still be preventDefaulted.
	 *
	 * This can be used to filter out mime types you can't handle with a library like `mime`. Mime type filtering is not handled by the extension since it can be complicated.
	 */
	filterFile: (file: File) => TFile | undefined
}

