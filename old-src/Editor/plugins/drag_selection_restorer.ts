/* eslint-disable @typescript-eslint/naming-convention */
import { undoDepth } from "prosemirror-history"
import { EditorState, Plugin, PluginKey, Selection, TextSelection, Transaction } from "prosemirror-state"
import type { EditorView } from "prosemirror-view"

/**
 * Use this symbol to set the selection on a mouse event so the plugin knows to save the selection.
 */
export const restore_selection: unique symbol = Symbol("handle-mousedown")
/**
 * Use this symbol to tel the plugin to offset the restored position.
 */
export const restore_offset: unique symbol = Symbol("handle-restore_offset")

/** Wrapper to correctly cast the mouse event so typescript doesn't complain about using a symbol. */
export type TaggedEvent_DragSelectionRestorer<T> = T & Partial<{
	[restore_selection]: Selection | undefined
	[restore_offset]: number | undefined
}>

/**
 * Since it can be tricky to understand what's triggering a restore, whether a transaction was blocked while dragging, etc, you set the debug option:
 * - If set to true, a string will be logged describing how the plugin handled the events.
 * - If you pass a function, the first parameter is the string describing the event, and the second contains any potentially useful info (transactions, state, etc) that is not logged with `debug: true` because it can be a lot of information.
 */
export type SelectionRestorerDebug = boolean | ((type: string, info?: Record<string, any>) => void)

function handle_debug(debug: SelectionRestorerDebug, type: string, info?: Record<string, any>): void {
	if (typeof debug === "function") {
		debug(type, info)
	} else {
		// eslint-disable-next-line no-console
		console.log(type)
	}
}

/**
 * Allows nodeViews to request their selections be restored after being dragged (e.g. from a handle) if the selection was inside whatever was being dragged.
 *
 * In the case that the selection started/ended outside what's being dragged, by default it will set the cursor to the end of what was being dragged.
 *
 * You can control this with the `fallback` option. By default it's set to `"end"`, which will place the cursor at the end of what was dragged. You can also set it to the `"start"` or `"select"` (which does nothing, and permits the default behavior of selecting what was dragged), or provide your own custom function to return a position. This function will be passed the previous selection, the restore offset (see point 3. below), the old state (whose selection tells us *what* was being dragged), and the new state (whose selection tells us *where* the content was dropped).
 *
 * By default this plugin also adds a class (`hide-selection` by default) to the editor while dragging occurs and it was requested to save the selection. This is useful for hiding the necessary selection changes needed to set *what* will be dragged. This can be turned off by just passing an empty string for the `class_name` option.
 *
 * Suggested css:
 * ```css
 * .hide-selection {
 * 	// sometimes on mousedown but before dragstart the selection can appear to be set near the handle
 * 	caret-color: rgba(0,0,0,0);
 * }
 * // note the space, it is NOT .hide-selection::selection
 * .hide-selection ::selection {
 * 	background: none;
 * }
 * ```
 *
 * For this to work nicely it requires the nodeview to:
 *
 * 1. Prevent prosemirror from handling drag events **NOT coming from the handle**, for example, any wrappers around the content which are draggable.
 *
 * 	The handle does not need to be an actual element. This can be done with pseudo element at a constant offset outside the node (e.g. to the left):
 *
 * 	```js
 * 	class SomeView {
 * 		stopEvent(e): boolean {
 * 			let to_right_of_handle = e.offsetX > 0
 * 			if (e.type.includes("drag") && to_right_of_handle) {
 * 				e.preventDefault()
 * 				return true
 * 			}
 * 			return false
 * 		}
 * 	}
 * 	```
 * 2. Tag mousedown events coming **from the handle**, this is what is referred by "tagging the event" or "requesting the selection be saved".
 *
 * 	This needs to be done from a mousedown event because mousedown events can modify the selection. This way it doesn't matter if anything modifies the selection on mousedown (e.g. by dispatching a transaction), since the nodeview gets to handle it first and tell the plugin the *true* selection before dragging.
 *
 * 	The plugin exports a symbol for this purpose. To tag an event, just use the exported symbol as a key:
 * 	```ts
 * 	import {
 * 		restore_selection,
 * 		TaggedEvent // for typescript users
 * 	} from "@alanscodelog/prosemirror/plugins/drag_selection_restorer"
 * class SomeView {
 * 	// ...
 * 	stopEvent(e: Event): boolean {
 * 		//...
 * 		// note that we check the event is not the left of the handle AND the content
 * 		// if we don't, in scenarios where the nodeviews can be nested this can cause parents to handle the event as well as children
 *			// the plugin will try to throw an error in such cases (since it's being asked to handle mousedown multiple times)
 * 		let on_handle = e.offsetX < 0 && e.offsetX > -handle_width
 * 		// mousedown ON drag handle
 * 		if (e.type === "mousedown" && on_handle) {
 * 			// for typescript users a type wrapper is provided to avoid errors
 * 			;(e as TaggedEvent<typeof e>)[restore_selection] = this.view.state.selection
 * 			// otherwise in plain js:
 * 			// e[restore_selection] = this.view.state.selection
 * 		}
 * 	}
 * }
 * 	```
 *
 * 3. Modify the selection on mousedown events coming **from the handle** to correctly match the nodeView.
 *
 * 	For example, if you have a list where each list item is a nodeView with a handle, if the user's selection spans multiple items, we don't want the handle to drag the current selection, only the node. Or for example, say you permit dragging the nodes the selection spans if a certain key is held down, you will need to set the selection to the start/end of those nodes exactly during the mousedown event.
 *
 * 	Additionally, in such cases the selection might need to be expanded on each side slightly to get the drop cursor to display more appropriate positions (while dragging the same content), but the plugin can't know this and the restored position will be wrong. It needs to be told to adjust the offset when restoring (you don't want to offset the selection saved since it's used by the plugin to set the selection correctly on undo). You can do this by setting the `restore_offset` symbol on the event. Note that this is only used if the selection can be restored (it is not used during fallback restores since since it should not be needed). In case it is, you can use a custom fallback, which is passed the offset as it's second parameter.
 *
 * 	```ts
 * import {
 * 		restore_selection,
 * 		restore_offset,
 * 		TaggedEvent // for typescript users
 * 	} from "@alanscodelog/prosemirror/plugins/drag_selection_restorer"
 * class SomeView {
 * 	// ...
 * 	stopEvent(e: Event): boolean {
 * 		//...
 * 		// mousedown ON drag handle
 * 		if (e instanceof MouseEvent && e.clientX < this.x && e.type === "mousedown") {
 * 			;(e as TaggedEvent<typeof e>)[restore_selection] = this.view.state.selection
 *  			let tr = this.view.state.tr
 * 			let from, to
 * 			if (e.ctrlKey) {
 * 					let {start, end, offset} = this.expand_selection(this.view.state.selection)
 * 					;(e as TaggedEvent<typeof e>)[restore_offset] = offset
 * 					from = start; end = to
 * 			} else if (selection_outside_node)  {
 * 					let { start, end }= this.constrain_selection(this.view.state.selection)
 * 					from = start; end = to
 * 			}
 * 			if (from !== undefined) {
 *  				tr.setSelection(TextSelection.create(tr.doc, from, to))
 *  				this.view.dispatch(tr)
 * 			}
 * 		}
 * 	}
 * }
 * 	```
 * #### Other Notes
 * - When a mouse event is tagged, any transactions from coming just after mousedown until mouseup/drop **that change the selection** are blocked unless they're coming from the plugin itself. I don't see why you would need to bypass this, but just in case, there's an escape hatch. Just set this meta:
 * ```ts
 * tr.setMeta("bypass-drag-selection-restorer-lock", true)
 * ```
 */
export function drag_selection_restorer({
	class_name = "hide-selection",
	fallback = "end",
	debug = false,
}: {
	class_name?: string
	fallback?: "select" | "start" | "end" | ((prev_selection: Selection, offset: number, old_state: EditorState, new_state: EditorState) => [number] | [number, number])
	debug?: SelectionRestorerDebug
} = {}): Plugin {
	const DID_NOT_DRAG = new PluginKey("restore-selection-did-not-drag")
	let key = new PluginKey(`selection-restorer`)
	let dropped = false
	let prev_selection: Selection | undefined
	let already_saved = false
	let offset = 0
	// if the user clicks but doesn't drag, prosemirror? sets the selection to the node
	// this is fine if we're dragging, but if we don't drag it sets the cursor near the handle
	let prevent_interference = false
	return new Plugin<Selection | undefined>({
		key,
		state: {
			init() { return undefined },
			apply(tr) {
				// when a transaction is coming from us, save it to the state
				// this allows us to later set the correct selection when the user undoes the dragging
				// otherwise the last selection set is used (which is set to what needs to be dragged)
				// which is not what we want
				if (tr.getMeta(key)) {
					let prev = prev_selection
					prev_selection = undefined
					return prev
				} else {
					return undefined
				}
			},
		},
		filterTransaction(tr, state) {
			let from_plugin = tr.getMeta("bypass-drag-selection-restorer-lock")
			let selection_changed = tr.selection.from !== state.selection.from || tr.selection.to !== state.selection.to
			if (prevent_interference && selection_changed && !from_plugin) {
				if (debug) handle_debug(debug, "prevented transaction", { tr, state, from_plugin, selection_changed })
				return false
			}
			if (debug) handle_debug(debug, "allowed transaction", { tr, state, from_plugin, selection_changed })

			return true
		},
		appendTransaction(trs: Transaction[], old_state: EditorState, new_state: EditorState): Transaction | void {
			let tr

			// user is undoing
			// see apply above for why this needed
			// let is_undo = trs.find(tr => tr.getMeta("history$")) !== undefined

			if (undoDepth(old_state) !== undoDepth(new_state)) {
				let plugin_old_state = key.getState(old_state)
				if (plugin_old_state) {
					tr = new_state.tr
					let { from, to } = plugin_old_state
					tr.setSelection(TextSelection.create(tr.doc, from, to))
					// just in case
					// tr.setMeta("addToHistory", true)
					// closeHistory(tr)
					if (debug) handle_debug(debug, "restoring selection after undo", { tr, old_state, new_state })
					return tr
				}
			}

			if (dropped) {
				if (prev_selection !== undefined) {
					let { from: prev_from, to: prev_to } = prev_selection

					tr = new_state.tr
					tr.setMeta(key, true)
					// just in case
					// tr.setMeta("addToHistory", false)
					// closeHistory(tr)

					// eslint-disable-next-line no-shadow
					let did_not_drag = trs.find(tr => tr.getMeta(DID_NOT_DRAG)) !== undefined

					// see mousedown listener, it's possible for the user to click the handle but never drag
					// so we should just restore the selection to the previous positions, regardless of what it was
					if (did_not_drag) {
						if (debug) handle_debug(debug, "restoring selection after NOT dragging", { tr, old_state, new_state })
						tr.setSelection(TextSelection.create(tr.doc, prev_from, prev_to))
					} else {
						// prev node position, NOT current
						let { from: node_start, to: node_end } = old_state.selection
						let { from: drop_start, to: drop_end } = new_state.selection

						if (prev_from > node_start && prev_to < node_end) {
							let start_offset = prev_from - node_start
							let end_offset = prev_to - node_start
							// selection was inside node, restore
							if (debug) handle_debug(debug, "restoring selection", { tr, old_state, new_state, offset })

							tr.setSelection(TextSelection.create(tr.doc, offset + drop_start + start_offset, offset + drop_start + end_offset))
						} else {
							if (debug) handle_debug(debug, "restoring selection using fallback", { tr, old_state, new_state })
							// selection was NOT inside node, restore as configured
							switch (fallback) {
								case "select": tr = undefined; break
								case "end":
									tr.setSelection(TextSelection.create(tr.doc, offset + drop_end))
									break
								case "start":
									tr.setSelection(TextSelection.create(tr.doc, offset + drop_start))
									break
								default: // function
									// @ts-expect-error WhAtTt
									tr.setSelection(TextSelection.create(tr.doc, ...fallback(prev_selection, offset, old_state, new_state)))
							}
						}
					}
					offset = 0
				}
				dropped = false
			}
			if (tr) return tr
		},
		props: {
			handleDOMEvents: {
				// @ts-expect-error we know the event type (note the problem is MouseEvent not the TaggedEvent wrapper)
				mousedown(view: EditorView, e: TaggedEvent_DragSelectionRestorer<MouseEvent>) {
					if (e[restore_selection] !== undefined) {
						if (debug) handle_debug(debug, "saving selection", { selection: e[restore_selection] })

						if (already_saved) {
							throw new Error("Tagged mouseup event firing multiple times. This probably means multiple node views are trying to save a selection. This can happen when the elements are nested, if we don't correctly check we only fire on that element's handle and not it's children's too.")
						}
						already_saved = true
						prev_selection = e[restore_selection]!
						offset = e[restore_offset] ?? 0
						prevent_interference = true
						if (class_name !== "") view.dom.classList.add(class_name)
					}
					return false
				},
				dragstart() {
					setTimeout(() => {
						// we still need this to be true when filterTransactions is called next
						// that's the transaction we want to prevent
						prevent_interference = false
					}, 0)
					return false
				},
				// it's possible the user clicked on the handle without dragging it
				// in which case, drop will never fire and appendTransaction will do nothing unless we intervene
				mouseup(view) {
					if (prev_selection) {
						if (debug) handle_debug(debug, "mouseup (did not drag)")
						if (class_name !== "") view.dom.classList.remove(class_name)
						dropped = true
						already_saved = false
						setTimeout(() => {
							// same problem as in dragstart
							prevent_interference = false
						}, 0)
						// force appendTransaction to fire
						let tr = view.state.tr
						// allow this transaction to bypass filterTransactions (since prevent_interference will still be true)
						tr.setMeta(DID_NOT_DRAG, true)
						tr.setMeta("bypass-drag-selection-restorer-lock", true)
						view.dispatch(tr)
					}
					return false
				},
			},
			handleDrop(view) {
				if (debug) handle_debug(debug, "drop (dragged)")
				if (class_name !== "") view.dom.classList.remove(class_name)
				dropped = true
				already_saved = false
				return false
			},
		},
	})
}
