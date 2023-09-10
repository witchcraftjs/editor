import { Plugin, PluginKey } from "@tiptap/pm/state"
import type { EditorView } from "@tiptap/pm/view"

export const selectingIndicatorPluginKey = new PluginKey(`selecting-indicator`)

export function selectingIndicatorPlugin({ className = "selecting" }: { className?: string } = {}): Plugin {
	let mightBeDragging = false
	let dragging = false
	return new Plugin({
		key: selectingIndicatorPluginKey,
		props: {
			handleDOMEvents: {
				pointerdown() {
					mightBeDragging = true
					return false
				},
				pointerover(view: EditorView) {
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
				pointerup(view: EditorView) {
					mightBeDragging = false
					dragging = false
					view.dom.classList.remove(className)
					return false
				}
			}
		}
	})
}
