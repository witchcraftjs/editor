import type { Editor } from "@tiptap/core"

import type { FileLoaderExtensionOptions } from "../types.js"


export function optionsCheck(editor: Editor, options: FileLoaderExtensionOptions): void {
	if (!options.handler) {
		throw new Error("The FileLoader needs to be configered with a handler (see FileLoaderHandler).")
	}
	if ((!options.handler.insertLoadingNode
		|| !options.handler.onLoadError
		|| !options.handler?.insertPosition)
	&& editor.state.schema.nodes.item === undefined) {
		throw new Error("Could not find item node in schema. Add the block extensions or specify a custom `handler.insertLoadingNode` function for the FileLoader.")
	}
}
