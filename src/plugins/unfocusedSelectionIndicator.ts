import { type EditorState, Plugin, PluginKey, type Selection, type Transaction } from "prosemirror-state"
import { Decoration, DecorationSet, type EditorView } from "prosemirror-view"


export const ignoreUnfocusedSelection = Symbol("ignoreUnfocusedSelection")

// eslint-disable-next-line @typescript-eslint/naming-convention
export type TaggedEvent_UnfocusedSelectionIndicator<T> = T & Partial<{
	[ignoreUnfocusedSelection]: boolean | undefined
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
 * - Whenever it restores a selection or the editor loses focus it must dispatch a new transaction which will have a "unfocusedSelectionIndicator" meta if you need to filter it.
 * - The plugin must stop prosemirror from handling the focus out event (it does not actually stop the event though).
 */
export function unfocusedSelectionIndicator(
	{
		main: mainClass = "unfocused-selection",
		start: startClass = `${mainClass}-start`,
		end: endClass = `${mainClass}-end`,
	}: Partial<Record<"main" | "start" | "end", string>> = {}): Plugin {
	const key = new PluginKey("unfocusedSelectionIndicator")
	let isFocused = false// = document.activeElement === view.dom
	let justFocused = false
	let lastSel: Selection | undefined
	let blurred = false
	function focusout(view: EditorView, e: MouseEvent): boolean {
		if (view.dom.contains(document.activeElement)) {
			return false
		}
		if (e.target !== view.dom) return false

		lastSel = view.state.selection
		if (lastSel.from === lastSel.to) {
			lastSel = undefined
		}
		isFocused = false
		const tr = view.state.tr
		tr.setMeta("ignore-unfocused-selection", true)
		view.dispatch(tr)
		return true
	}
	return new Plugin<DecorationSet>({
		key,
		state: {
			init() { return DecorationSet.empty },
			apply(tr: Transaction) {
				const { from, to, $from, $to } = tr.selection
				if (isFocused || from === to || tr.getMeta("ignore-unfocused-selection")) return DecorationSet.empty

				const decos: Decoration[] = []
				decos.push(Decoration.inline($from.end(), $to.start(), { class: mainClass }))
				decos.push(Decoration.inline(from, $from.end(), { class: `${mainClass} ${startClass}` }))
				decos.push(Decoration.inline($to.start(), to, { class: `${mainClass} ${endClass}` }))
				return DecorationSet.create(tr.doc, decos)
			},
		},
		// prevent transactions caused by us focusing in
		filterTransaction() {
			if (justFocused) {
				justFocused = false
				return false
			}
			return true
		},
		props: {
			decorations(state: EditorState) {
				return this.getState(state)
			},
			handleDOMEvents: {
				blur(view: EditorView, e: FocusEvent) {
					if (document.activeElement === view.dom) {
						blurred = true
					} else {
						focusout(view, e as MouseEvent)
					}
					return false
				},
				mousedown(view: EditorView, e: FocusEvent) {
					if (view.dom.contains(document.activeElement)) {
						isFocused = true

						if (blurred) {
							blurred = false
							e.preventDefault()
							return true
						}
						return false
					}
					if (isFocused) {
						return false
					} else {
						if (lastSel) {
							(view.dom as HTMLElement).focus()
							justFocused = true
							setTimeout(() => {
								if (lastSel) {
									const tr = view.state.tr
									tr.setMeta("ignore-unfocused-selection", true)
									tr.setSelection(lastSel)
									lastSel = undefined
									view.dispatch(tr)
								}
							})
						}
						isFocused = true
						return false
					}
				},
			},
		},
	})
}
