import { type EditorState, Plugin, PluginKey, type Selection, TextSelection, type Transaction } from "@tiptap/pm/state"
import { Decoration, DecorationSet, type EditorView } from "@tiptap/pm/view"

export const unfocusedSelectionIndicatorKey = new PluginKey("unfocusedSelectionIndicator")
/**
 * Shows a fake selection decoration while the editor is unfocused and restores the previous selection\* when the editor gains focus again. It also prevents initial focus in events from changing the selection (when it's a selection and not a single position).
 *
 * So if the user focuses on something like the search bar or the devtools panel, focusing back to the editor doesn't change the selection.
 *
 * Focusing other elements inside the editor does not count as blurring the editor.
 *
 * The plugin will add three classes to the decorations, the main class to all the nodes, then the start and end classes to the start and end nodes respectively. This is so you can style the selection correctly since everything from the start right up to the end will have a little extra padding to the right. Therefore technically the start class is not needed, but it's there if needed.
 *
 * Some css like this is needed to make it work. The tailwind classes already include some `pm-unfocused-selection` and `pm-unfocused-selection-end` utility classes that take care of this. They use the css variable `--pmUnfocusedSelectionColor` to set the color. They look like this:
 *
 * ```scss
 * .pm-unfocused-selection {
 * 	background-color: var(--pmUnfocusedSelectionColor);
 * 	box-shadow: 5px 0 0 0 var(--pmUnfocusedSelectionColor);
 * }
 * .pm-unfocused-selection-end {
 * 	box-shadow: none;
 * }
 * ```
 * Note regarding styling:
 *
 * It does not seem possible to get the real default color of selections so the best alternative is probably to use a custom selection color for the real selection. But just setting the same color to both won't work. The real selection gets some transparency added automatically so they will look different, plus the text changes color to indicate focus (which we wouldn't really want).
 *
 * Other Notes:
 * - Whenever it restores a selection or the editor loses focus it must dispatch a new transaction which will have the "unfocused-selection" meta if you need to filter it.
 * - If you want to hide the unfocused selection decorations you can set the
 *   `hide-unfocused-selection` meta on the transaction.
 * - If you change the selection while the editor is considered unfocused, the saved selection will be changed to the new selection.
 */
export function unfocusedSelectionIndicatorPlugin(
	{
		main: mainClass = "pm-unfocused-selection",
		start: startClass = `${mainClass}-start`,
		end: endClass = `${mainClass}-end`
	}: Partial<Record<"main" | "start" | "end", string>> = {}): Plugin {
	return new Plugin<{
		decos: DecorationSet
		savedSel: Selection | undefined
	}>({
		key: unfocusedSelectionIndicatorKey,
		state: {
			init() {
				return {
					decos: DecorationSet.empty,
					savedSel: undefined
				}
			},
			apply(tr: Transaction, value, _oldState, newState) {
				const trValue = tr.getMeta(unfocusedSelectionIndicatorKey)
				if (!trValue) return value
				const newValue = { ...value, ...trValue }
				if (!newValue.savedSel) {
					newValue.decos = DecorationSet.empty
					return newValue
				}
				const { from, to } = newValue.savedSel
				if (newState.selection.from !== from || newState.selection.to !== to) {
					newValue.savedSel = newState.selection
				}

				const hideUnfocusedSelection = from === to || !!tr.getMeta("hide-unfocused-selection")
				newValue.decos = hideUnfocusedSelection
					? DecorationSet.empty
					: DecorationSet.create(tr.doc, [
							Decoration.inline(from, from + 1, { class: `${mainClass} ${startClass}` }),
							Decoration.inline(from + 1, to - 1, { class: `${mainClass}` }),
							Decoration.inline(to - 1, to, { class: `${mainClass} ${endClass}` })
						])

				return newValue
			}
		},

		props: {
			decorations(state: EditorState) {
				return this.getState(state)?.decos
			},
			handleDOMEvents: {
				blur(view: EditorView, e: FocusEvent) {
					if (e.relatedTarget instanceof Node && view.dom.contains(e.relatedTarget)) return
					const tr = view.state.tr
					if (!view.state.selection.empty) {
						tr.setMeta("unfocused-selection", true)
						tr.setMeta(unfocusedSelectionIndicatorKey, { savedSel: view.state.selection })
					}
					view.dispatch(tr)
				},
				focusin(view: EditorView) {
					const savedSel = unfocusedSelectionIndicatorKey.getState(view.state)?.savedSel
					if (savedSel) {
						const tr = view.state.tr
						tr.setMeta("unfocused-selection", true)
						tr.setMeta(unfocusedSelectionIndicatorKey, { savedSel: undefined })
						tr.setSelection(TextSelection.create(view.state.doc, savedSel.from, savedSel.to))
						view.dispatch(tr)
					}
				}

			}
		}
	})
}
