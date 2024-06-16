import { Plugin, PluginKey } from "prosemirror-state"
import { type EditorView } from "prosemirror-view"


export function selectingIndicator({ className = "selecting" }: { className?: string } = {}): Plugin {
	const key = new PluginKey(`selecting-indicator`)
	let mightBeDragging = false
	let dragging = false
	return new Plugin({
		key,
		props: {
			handleDOMEvents: {
				mousedown() {
					mightBeDragging = true
					return false
				},
				mouseover(view: EditorView) {
					if (mightBeDragging) {
						if (dragging) return false
						dragging = true
						view.dom.classList.add(className)
					} else {
						if (!dragging) return false
						dragging = false
						view.dom.classList.remove(className)
					}
					return false
				},
				mouseup(view: EditorView) {
					mightBeDragging = false
					dragging = false
					view.dom.classList.remove(className)
					return false
				},
			},
		},
	})
}

