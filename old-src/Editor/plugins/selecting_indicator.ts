import { Plugin, PluginKey } from "prosemirror-state"


export function selecting_indicator({ class_name = "selecting" }: { class_name?: string } = {}): Plugin {
	let key = new PluginKey(`selecting-indicator`)
	let might_be_dragging = false
	let dragging = false
	return new Plugin({
		key,
		props: {
			handleDOMEvents: {
				mousedown() {
					might_be_dragging = true
					return false
				},
				mouseover(view) {
					if (might_be_dragging) {
						if (dragging) return false
						dragging = true
						view.dom.classList.add(class_name)
					} else {
						if (!dragging) return false
						dragging = false
						view.dom.classList.remove(class_name)
					}
					return false
				},
				mouseup(view) {
					might_be_dragging = false
					dragging = false
					view.dom.classList.remove(class_name)
					return false
				},
			},
		},
	})
}

