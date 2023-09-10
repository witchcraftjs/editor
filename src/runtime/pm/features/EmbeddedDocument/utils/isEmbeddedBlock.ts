import type { EditorView } from "@tiptap/pm/view"

/**
	* Returns whether the current view is a block embed embedded in another view.
	*
	* This is done by checking if the immediate parent has the class `editor-is-embedded-block` which the editor component adds when it receives the {@link isEmbeddedBlockInjectionKey} injection key.
	*
	* We cannot do this via state since a document can be both embedded and not embedded at the same time.
	*/
export function isEmbeddedBlock(view: EditorView): boolean {
	return view.dom.parentElement?.classList.contains("editor-is-embedded-block") ?? false
}
