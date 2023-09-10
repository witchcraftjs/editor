import { mergeAttributes, Node } from "@tiptap/core"

import { insertFile } from "./commands/insertFile.js"
import { fileLoaderPlugin } from "./plugins/fileLoaderPlugin.js"
import type { FileLoaderExtensionOptions } from "./types.js"
import { optionsCheck } from "./utils/optionsCheck.js"

import { isValidId } from "../Blocks/utils/isValidId.js"

/**
 * Provides a way to asynchronously load files into the editor and a node to display while they are loading.
 *
 * An {@link IFileLoaderHandler} interface should be passed to describe what to do with the file at each step. There is a default implementation at {@link FileLoaderHandler} that tries to handler as much as possible. See it for details.
 *
 * It also automatically removes fileLoader nodes when the document is loaded. You can disable this with the `cleanupOnLoad` option.
 *
 * To force the plugin to cleanup after the first load you can do `tr.setMeta("cleanFileLoaders")`.
 *
 * A basic node view that can preview images is provided but not configured.
 *
 */

// eslint-disable-next-line @typescript-eslint/naming-convention
export const FileLoader = Node.create<FileLoaderExtensionOptions>({
	name: "fileLoader",
	content: "",
	marks: "",
	group: "block",
	addOptions() {
		return {
			cleanupOnLoad: true,
			onDrop: undefined,
			onPaste: undefined,
			// there are checks on init to throw if the user didn't configure a handler
			handler: undefined as any,
			embeddedBlockCommandRedirect: undefined,
			HTMLAttributes: {
				class: `
					rounded-sm
					animate-pulse
					bg-accent-200
					text-accent-800
					dark:bg-accent-700
					dark:text-accent-300
					px-2
				`
			}
		}
	},
	addAttributes() {
		return {
			HTMLAttributes: {
				default: { }
			},
			/** For the optional FileLoaderNodeView. */
			preview: {
				default: undefined
			},
			fileName: {
				default: undefined
			},
			loading: {
				default: true
			},
			loadingId: {
				default: undefined
			}
		}
	},
	parseHTML() {
		return [
			{
				tag: `div[type=${this.name}]`,
				getAttrs: dom => {
					const fileName = dom.getAttribute("file-name")
					const loading = dom.getAttribute("file-loading")
					const loadingId = dom.getAttribute("file-loading-id")
					return {
						fileName,
						loadingId: isValidId(loadingId, 10) ? loadingId : undefined,
						loading: loading === "true"
					}
				}
			}
		]
	},

	// eslint-disable-next-line @typescript-eslint/naming-convention
	renderHTML({ node, HTMLAttributes }) {
		return [
			"div",
			mergeAttributes(
				this.options.HTMLAttributes,
				HTMLAttributes,
				{
					"file-loading-id": node.attrs.loadingId,
					"file-name": node.attrs.fileName,
					"file-loading": node.attrs.loading,
					type: this.name
				}
			),
			`Loading "${node.attrs.fileName ?? "Unknown"}" ...`
		]
	},
	addCommands() {
		optionsCheck(this.editor, this.options)
		const self = this
		return {
			insertFile: insertFile(self.options.handler)
		}
	},
	addProseMirrorPlugins() {
		const self = this
		return [
			fileLoaderPlugin(self.editor, self.options)
		]
	}
})

export type NodeFileLoaderName = "fileLoader"
