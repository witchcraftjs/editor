import type { MakeOptional } from "@alanscodelog/utils/types"
import { unreachable } from "@alanscodelog/utils/unreachable"
import type { Editor } from "@tiptap/core"
import { nanoid } from "nanoid"

import { findUpwards } from "../../../utils/findUpwards.js"
import type { IFileLoaderHandler } from "../types.js"
import { cleanupFileLoaderNode } from "../utils/cleanupFileLoaderNode.js"

/**
 * A partial implementation of {@link IFileLoaderHandler}.
 *
 * Using the defaults of this class, you only need to specify the handler's `loadFile` and `replaceLoadingNode` properties.
 *
 * It assumes the use of the {@link Item} extension since it uses the node to wrap the fileLoader node.
 *
 * To identify each fileLoader node and fetch it again once the file is loaded, it uses a 10 character nanoid.
 */
export class FileLoaderHandler<
	TFile extends File,
	T = { file: TFile, result: string | ArrayBuffer | null },
	TKey = string
>implements IFileLoaderHandler<TFile, T, TKey> {
	loadFile: IFileLoaderHandler<TFile, T, TKey>["loadFile"]

	onLoadError: IFileLoaderHandler<TFile, T, TKey>["onLoadError"]

	insertPosition: IFileLoaderHandler<TFile, T, TKey>["insertPosition"]

	insertLoadingNode: IFileLoaderHandler<TFile, T, TKey>["insertLoadingNode"]

	replaceLoadingNode: IFileLoaderHandler<TFile, T, TKey>["replaceLoadingNode"]

	filterFile: IFileLoaderHandler<TFile, T, TKey>["filterFile"]

	constructor(
		opts: MakeOptional<IFileLoaderHandler<TFile, T, TKey>, "onLoadError" | "insertPosition" | "insertLoadingNode">
	) {
		this.loadFile = opts.loadFile
		this.replaceLoadingNode = opts.replaceLoadingNode

		if (opts.onLoadError) this.onLoadError = opts.onLoadError
		else this.onLoadError = this.defaultOnLoadError
		if (opts.insertPosition) this.insertPosition = opts.insertPosition
		else this.insertPosition = this.defaultInsertPosition
		if (opts.insertLoadingNode) this.insertLoadingNode = opts.insertLoadingNode
		else this.insertLoadingNode = this.defaultInsertLoadingNode
		if (opts.filterFile) this.filterFile = opts.filterFile
		else this.filterFile = this.defaultFilterFile
	}

	defaultFilterFile(file: File): TFile | undefined {
		return file as TFile
	}

	defaultInsertPosition(_file: TFile, editor: Editor, pos?: number): number | undefined {
		const position = pos ?? editor.state.selection.anchor
		const $insertionNode = findUpwards(editor.state.doc, position, $node => {
			if ($node.node().type.name === "item") {
				return true
			}
			return false
		}).$pos
		return $insertionNode ? $insertionNode.end() + 1 : undefined
	}

	defaultOnLoadError(_file: TFile, editor: Editor, pos: number | undefined): void {
		if (pos === undefined) unreachable()
		editor.commands.command(({ tr }) => {
			cleanupFileLoaderNode(
				tr,
				pos,
				editor.schema.nodes.fileLoader,
				[
					editor.state.schema.nodes.item,
					editor.state.schema.nodes.list
				],
				editor.schema.nodes.paragraph
			)
			return true
		})
	}

	defaultInsertLoadingNode(file: TFile, editor: Editor, insertPos: number): TKey {
		const attrs = {
			loadingId: nanoid(10),
			fileName: file.name,
			loading: true
		}
		editor.commands.command(({ tr }) => {
			const pm = editor.schema.nodes
			tr.insert(insertPos, pm.item.create(
				{},
				pm.fileLoader.create(attrs)
			))
			return true
		})
		return attrs.loadingId as TKey
	}
}
