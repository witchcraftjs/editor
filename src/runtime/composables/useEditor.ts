import type { EditorOptions } from "@tiptap/core"
import { Editor } from "@tiptap/vue-3"
import { onBeforeUnmount, shallowRef } from "vue"
/**
 * Unline tiptap's useEditor, this does not auto-mount the editor. Instead the returned `recreate` function must be called manually. This was built with the use of {@link useContentEditor} in mind.
 */
export const useEditor = (options: Partial<EditorOptions> = {}) => {
	const editor = shallowRef<Editor>()
	function recreate(
		modifyOptions?: (options: Partial<EditorOptions>) => Partial<EditorOptions>
	): void {
		options = modifyOptions?.(options) ?? options
		editor.value?.destroy()
		editor.value = new Editor(options)
	}

	// copied from tiptap
	onBeforeUnmount(() => {
		// Cloning root node (and its children) to avoid content being lost by destroy
		const nodes = editor.value?.options.element
		if (nodes && !(nodes instanceof HTMLElement)) {
			// eslint-disable-next-line no-console
			console.warn(`Expected editor element to be an HTMLElement, got ${nodes.constructor.name}: ${nodes}`)
			return
		}
		const newEl = nodes?.cloneNode(true) as HTMLElement

		nodes?.parentNode?.replaceChild(newEl, nodes)

		editor.value?.destroy()
	})

	return { editor, recreate }
}
