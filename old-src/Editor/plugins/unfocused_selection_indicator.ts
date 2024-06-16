import { Plugin, PluginKey, Selection } from "prosemirror-state"
import { Decoration, DecorationSet, EditorView } from "prosemirror-view"


export const ignore_unfocused_selection = Symbol("ignore_unfocused_selection")

// eslint-disable-next-line @typescript-eslint/naming-convention
export type TaggedEvent_UnfocusedSelectionIndicator<T> = T & Partial<{
	[ignore_unfocused_selection]: boolean | undefined
}>

/**
 * Shows a fake selection decoration while the editor is unfocused and restores the previous selection\* when the editor gains focus again. It also prevents initial focus in events from changing the selection\*. So if the user focuses on something like the search bar or the devtools panel, focusing back to the editor doesn't change the selection.
 *
 * \* When it's a selection, not a single position.
 *
 * This will add three classes, the main class to all the nodes, then the start and end classes to the start and end nodes respectively. This is so you can style the selection correctly since everything from the start right up to the end will have a little extra padding to the right. Therefore technically the start class is not needed, but it's there if needed.
 *
 * ```scss
 * .unfocused-selection {
 * 	position:relative;
 * 	z-index: 0;
 * 	&::before {
 * 		z-index: -1;
 * 		content: "";
 * 		position:absolute;
 * 		top:0; bottom:0; left:0;
 * 		right:-0.27em; // it's weirdly specific but correct
 * 		// ... color styles
 * 	}
 * }
 * .unfocused-selection-end::before {
 * 	right:0;
 * }
 * ```
 * Note regarding styling:
 *
 * It does not seem possible to get the real default color of selections so the best alternative is probably to use a custom selection color for the real selection. But just setting the same color to both won't work. The real selection gets some transparency added automatically so they will look different. Instead you must use rgba colors. So long as the alpha value is not 1 (it can be 0.99), it will use your alpha value and not add transparency.
 *
 * Really using the same exact color for unfocused/focused selection feels off (since it feels like the editor still has focus), but even with two different colors, the browser will dim the real selection so much the unfocused color can look brighter even if you're picking a darker color.
 *
 * Other Notes:
 * - Whenever it restores a selection or the editor loses focus it must dispatch a new transaction which will have a "unfocused_selection_indicator" meta if you need to filter it.
 * - The plugin must stop prosemirror from handling the focus out event (it does not actually stop the event though).
 */
export function unfocused_selection_indicator(
	{
		main: main_class = "unfocused-selection",
		start: start_class = `${main_class}-start`,
		end: end_class = `${main_class}-end`,
	}: Partial<Record<"main" | "start" | "end", string>> = {}): Plugin {
	let key = new PluginKey("unfocused_selection_indicator")
	let is_focused = false// = document.activeElement === view.dom
	let just_focused = false
	let last_sel: Selection | undefined
	let blurred = false
	function focusout(view: EditorView, e: MouseEvent): boolean {
		if (view.dom.contains(document.activeElement)) {
			return false
		}
		if (e.target !== view.dom) return false

		last_sel = view.state.selection
		if (last_sel.from === last_sel.to) {
			last_sel = undefined
		}
		is_focused = false
		let tr = view.state.tr
		tr.setMeta("ignore-unfocused-selection", true)
		view.dispatch(tr)
		return true
	}
	return new Plugin<DecorationSet>({
		key,
		state: {
			init() { return DecorationSet.empty },
			apply(tr) {
				let { from, to, $from, $to } = tr.selection
				if (is_focused || from === to || tr.getMeta("ignore-unfocused-selection")) return DecorationSet.empty

				let decos: Decoration[] = []
				decos.push(Decoration.inline($from.end(), $to.start(), { class: main_class }))
				decos.push(Decoration.inline(from, $from.end(), { class: `${main_class} ${start_class}` }))
				decos.push(Decoration.inline($to.start(), to, { class: `${main_class} ${end_class}` }))
				return DecorationSet.create(tr.doc, decos)
			},
		},
		// prevent transactions caused by us focusing in
		filterTransaction() {
			if (just_focused) {
				just_focused = false
				return false
			}
			return true
		},
		props: {
			decorations(state) {
				return this.getState(state)
			},
			handleDOMEvents: {
				blur(view, e) {
					if (document.activeElement === view.dom) {
						blurred = true
					} else {
						focusout(view, e as MouseEvent)
					}
					return false
				},
				mousedown(view, e) {
					if (view.dom.contains(document.activeElement)) {
						is_focused = true

						if (blurred) {
							blurred = false
							e.preventDefault()
							return true
						}
						return false
					}
					if (is_focused) {
						return false
					} else {
						if (last_sel) {
							(view.dom as HTMLElement).focus()
							just_focused = true
							setTimeout(() => {
								if (last_sel) {
									let tr = view.state.tr
									tr.setMeta("ignore-unfocused-selection", true)
									tr.setSelection(last_sel)
									last_sel = undefined
									view.dispatch(tr)
								}
							})
						}
						is_focused = true
						return false
					}
				},
			},
		},
	})
}
