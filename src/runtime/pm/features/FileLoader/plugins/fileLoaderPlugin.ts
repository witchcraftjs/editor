import type { Editor } from "@tiptap/core"
import { Plugin, PluginKey, type Transaction } from "@tiptap/pm/state"

import type { FileLoaderExtensionOptions } from "../types.js"
import { cleanupFileLoaderNodes } from "../utils/cleanupFileLoaderNodes.js"

export const fileLoaderPluginKey = new PluginKey("fileLoader")

export function fileLoaderPlugin(
	editor: Editor,
	options: Pick<FileLoaderExtensionOptions, "cleanupOnLoad">
): Plugin<any> {
	let cleaned = false
	return new Plugin({
		key: fileLoaderPluginKey,
		/** See {@link DocumentApi} */
		stateInit: (tr: Transaction) => {
			if (!options.cleanupOnLoad) return
			cleaned = true
			return cleanupFileLoaderNodes(
				tr,
				editor.schema,
				editor.state.schema.nodes.fileLoader,
				[
					editor.state.schema.nodes.item,
					editor.state.schema.nodes.list
				],
				editor.state.schema.nodes.paragraph
			)
		},
		// in case the documentApi isn't being used to load documents
		appendTransaction: (_, _oldState, newState) => {
			if (!newState.tr.getMeta("cleanFileLoaders") && (!options.cleanupOnLoad || cleaned)) return
			cleaned = true
			return cleanupFileLoaderNodes(
				newState.tr,
				editor.schema,
				editor.state.schema.nodes.fileLoader,
				[
					editor.state.schema.nodes.item,
					editor.state.schema.nodes.list
				],
				editor.state.schema.nodes.paragraph
			)
		},
		filterTransaction: tr => {
			if (tr.getMeta("fileLoaderIgnore")) return false
			return true
		},
		props: {
			handleDOMEvents: {
				drop: (view, event) => {
					event.preventDefault()
					const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })
					if (!pos) return
					const position = pos.inside > 0 ? pos.inside : pos.pos - 1
					const files = Array.from(event.dataTransfer?.files ?? [])
					void editor.commands.insertFile(files, position)
				},
				paste: (_view, event) => {
					const files = Array.from(event.clipboardData?.files ?? [])
					const htmlContent = event.clipboardData?.getData("text/html")
					// let the editor handle it
					if (htmlContent) return
					void editor.commands.insertFile(files)
				}
			}
		}
	})
}
