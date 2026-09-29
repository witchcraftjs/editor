import type { Editor } from "@tiptap/core"
import type { Node } from "@tiptap/pm/model"

/**
 * Finds embedded editors rendered inside a root editor.
 *
 * Walks the root document for `embeddedDoc` nodes, resolves each node's DOM element via the ProseMirror view, then walks up to the Vue component instance that owns it (the Editor.vue wrapper) and reads its exposed tiptap editor.
 */
export function getEmbeddedEditors(
	rootEditor: Editor,
	/** Only return embeds pointing at this docId. Omit to return all. */
	docId?: string
): Editor[] {
	const editors: Editor[] = []
	rootEditor.state.doc.descendants((node: Node, pos) => {
		if (node.type.name !== "embeddedDoc") return undefined
		const embedId = node.attrs.embedId as { docId?: string, blockId?: string } | undefined
		if (docId && embedId?.docId !== docId) return undefined

		const dom = rootEditor.view.nodeDOM(pos) as HTMLElement | null
		if (!dom) return undefined

		// the nodeview's root element is an ancestor of the inner editor's .ProseMirror;
		// find it, then walk up to the Vue component instance that owns it (the Editor.vue wrapper)
		const pmEl = dom.querySelector(".ProseMirror") ?? dom
		let el: Element | null = pmEl
		let comp: any = null
		while (el) {
			const candidate = (el as any).__vueParentComponent
			if (candidate?.exposed?.editor) {
				comp = candidate
				break
			}
			el = el.parentElement
		}
		const exposedEditor = comp?.exposed?.editor
		const editor = exposedEditor?.value ?? exposedEditor
		if (editor) {
			editors.push(editor)
		}
		return undefined
	})
	return editors
}
