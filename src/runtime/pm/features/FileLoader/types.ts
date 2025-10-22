import type { Editor } from "@tiptap/core"

import type { HTMLAttributesOptions } from "../../../types/index.js"
import type { WithOnTriggerByEmbeddedBlockOptions } from "../EmbeddedDocument/types.js"

export interface FileLoaderExtensionOptions extends HTMLAttributesOptions, WithOnTriggerByEmbeddedBlockOptions {
	/**
	 * By default, the plugin removes fileLoader nodes using {@link cleanupFileLoaderNodes} when the document is loaded. This can happen if the user interrupts a file load/upload/save and the document is saved with a fileLoader node.
	 *
	 * We can't keep a reference to the file they wanted to load without external work, so the nodes are removed.
	 */
	cleanupOnLoad?: boolean
	/** See {@link IFileLoaderHandler} */
	handler: IFileLoaderHandler<File, any>
}

/**
 * Helps handle the loading of files. Provides a way to adjust the insert position and takes care of keeping track of loading vs loaded nodes.
 *
 * See {@link FileLoaderHandler} for a partial implementation you can customize to create the interface.
 *
 * The insert handlers are called with the files in reverse order so that you can more easily insert them one after the other without position mapping.
 */

// eslint-disable-next-line @typescript-eslint/naming-convention
export type IFileLoaderHandler<
	TFile extends File,
	T = { file: TFile, result: string | ArrayBuffer | null },
	TKey = string
> = {
	/**
	 * Should load/save/upload the file and return the information neccesary to create the loaded node.
	 *
	 * The `insertId` and `editor` are provided in case you're uploading the file or doing some other heavy operation and want to update the fileLoader node as soon as you can load the image.
	 *
	 * A `FileLoaderNodeView` is provided (but no pre-configured) for these purposes. If you set the node's `preview` property it will use it as the src for an image.
	 */
	loadFile: (file: TFile, insertId: TKey, editor: Editor) => Promise<T | undefined>
	/**
	 * This can be used to remove the loading node on errors.
	 *
	 * The default {@link FileLoaderHandler.onLoadError} uses {@link cleanupFileLoaderNodes} to remove the parent item node if possible, otherwise it turns the fileLoader node into a paragraph.
	 */
	onLoadError: (
		file: TFile,
		editor: Editor,
		pos: number | undefined,
		error: Error,
		loadingKey: TKey
	) => void

	/**
	 *
	 * Where to insert the fileLoader node.
	 *
	 * The default @{@link FileLoaderHandler.insertPosition} returns the position after the closest parent item node. The idea being one inserts a new item node there with a loading file node inside.
	 *
	 * You can override this by returning a different position. If no position is returned, no node is inserted.
	 */
	insertPosition: (file: TFile, editor: Editor, pos?: number) => number | undefined
	/**
	 * Given a file, should insert a fileLoader node with the `loadingId` set to a unique key that the extension can then use to find the node again. It should return this key if it inserted the node.
	 *
	 * Using the file name is not a good idea as it's not guaranteed to be unique if the user inserts the same item twice.
	 *
	 * The default {@link FileLoaderHandler.insertLoadingNode} inserts a new item node with a fileLoader node inside after in the closest viable position after the insertPos. It uses a nanoid for the loading id.
	 */
	insertLoadingNode: (file: TFile, editor: Editor, insertPos: number, originalPos?: number) => TKey | undefined
	/**
	 * After loading the file, if it's successful, this is passed the result and the position of the fileLoader node.
	 *
	 * Note that this position points at the node with those attributes, and not it's parent in the case of having inserted a wrapping node.
	 *
	 *
	 */
	replaceLoadingNode: (
		editor: Editor,
		pos: number,
		res: T,
		loadingKey: TKey
	) => void
	/**
	 * Return the file (or whatever type you'd like) to allow the extension to handle it.
	 *
	 * If the function doesn't return anything, the file will be ignored.
	 * No fileLoader node will be created. The event will still be preventDefaulted.
	 *
	 * This can be used to filter out mime types you can't handle with a library like `mime`. Mime type filtering is not handled by the extension since it can be complicated.
	 */
	filterFile: (file: File) => TFile | undefined
}
