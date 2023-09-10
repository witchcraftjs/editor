/** [ignore] */
import { undoDepth } from "prosemirror-history"
import { type EditorState, Plugin, PluginKey, type Selection, TextSelection, type Transaction } from "prosemirror-state"
import type { EditorView } from "prosemirror-view"

/**
 * Use this symbol to set the selection on a mouse event so the plugin knows to save the selection.
 */
export const restoreSelection: unique symbol = Symbol("handle-mousedown")
/**
 * Use this symbol to tel the plugin to offset the restored position.
 */
export const restoreOffset: unique symbol = Symbol("handle-restoreOffset")

/** Wrapper to correctly cast the mouse event so typescript doesn't complain about using a symbol. */
// eslint-disable-next-line @typescript-eslint/naming-convention
export type TaggedEvent_DragSelectionRestorer<T> = T & Partial<{
	[restoreSelection]: Selection | undefined
	[restoreOffset]: number | undefined
}>

/**
 * Since it can be tricky to understand what's triggering a restore, whether a transaction was blocked while dragging, etc, you set the debug option:
 * - If set to true, a string will be logged describing how the plugin handled the events.
 * - If you pass a function, the first parameter is the string describing the event, and the second contains any potentially useful info (transactions, state, etc) that is not logged with `debug: true` because it can be a lot of information.
 */
export type SelectionRestorerDebug = boolean | ((type: string, info?: Record<string, any>) => void)

function handleDebug(debug: SelectionRestorerDebug, type: string, info?: Record<string, any>): void {
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
 * By default this plugin also adds a class (`hide-selection` by default) to the editor while dragging occurs and it was requested to save the selection. This is useful for hiding the necessary selection changes needed to set *what* will be dragged. This can be turned off by just passing an empty string for the `className` option.
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
 * 		restoreSelection,
 * 		TaggedEvent // for typescript users
 * 	} from "@alanscodelog/prosemirror/plugins/dragSelectionRestorer"
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
 * 			;(e as TaggedEvent<typeof e>)[restoreSelection] = this.view.state.selection
 * 			// otherwise in plain js:
 * 			// e[restoreSelection] = this.view.state.selection
 * 		}
 * 	}
 * }
 * 	```
 *
 * 3. Modify the selection on mousedown events coming **from the handle** to correctly match the nodeView.
 *
 * 	For example, if you have a list where each list item is a nodeView with a handle, if the user's selection spans multiple items, we don't want the handle to drag the current selection, only the node. Or for example, say you permit dragging the nodes the selection spans if a certain key is held down, you will need to set the selection to the start/end of those nodes exactly during the mousedown event.
 *
 * 	Additionally, in such cases the selection might need to be expanded on each side slightly to get the drop cursor to display more appropriate positions (while dragging the same content), but the plugin can't know this and the restored position will be wrong. It needs to be told to adjust the offset when restoring (you don't want to offset the selection saved since it's used by the plugin to set the selection correctly on undo). You can do this by setting the `restoreOffset` symbol on the event. Note that this is only used if the selection can be restored (it is not used during fallback restores since since it should not be needed). In case it is, you can use a custom fallback, which is passed the offset as it's second parameter.
 *
 * 	```ts
 * import {
 * 		restoreSelection,
 * 		restoreOffset,
 * 		TaggedEvent // for typescript users
 * 	} from "@alanscodelog/prosemirror/plugins/dragSelectionRestorer"
 * class SomeView {
 * 	// ...
 * 	stopEvent(e: Event): boolean {
 * 		//...
 * 		// mousedown ON drag handle
 * 		if (e instanceof MouseEvent && e.clientX < this.x && e.type === "mousedown") {
 * 			;(e as TaggedEvent<typeof e>)[restoreSelection] = this.view.state.selection
 *  			let tr = this.view.state.tr
 * 			let from, to
 * 			if (e.ctrlKey) {
 * 					let {start, end, offset} = this.expand_selection(this.view.state.selection)
 * 					;(e as TaggedEvent<typeof e>)[restoreOffset] = offset
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
export function dragSelectionRestorer({
	className = "hide-selection",
	fallback = "end",
	debug = false,
}: {
	className?: string
	fallback?: "select" | "start" | "end" | ((prevSelection: Selection, offset: number, oldState: EditorState, newState: EditorState) => [number] | [number, number])
	debug?: SelectionRestorerDebug
} = {}): Plugin {
	const DID_NOT_DRAG = new PluginKey("restore-selection-did-not-drag")
	const key = new PluginKey(`selection-restorer`)
	let dropped = false
	let prevSelection: Selection | undefined
	let alreadySaved = false
	let offset = 0
	// if the user clicks but doesn't drag, prosemirror? sets the selection to the node
	// this is fine if we're dragging, but if we don't drag it sets the cursor near the handle
	let preventInterference = false
	return new Plugin<Selection | undefined>({
		key,
		state: {
			init() { return undefined },
			apply(tr: Transaction) {
				// when a transaction is coming from us, save it to the state
				// this allows us to later set the correct selection when the user undoes the dragging
				// otherwise the last selection set is used (which is set to what needs to be dragged)
				// which is not what we want
				if (tr.getMeta(key)) {
					const prev = prevSelection
					prevSelection = undefined
					return prev
				} else {
					return undefined
				}
			},
		},
		filterTransaction(tr: Transaction, state: EditorState) {
			const fromPlugin = tr.getMeta("bypass-drag-selection-restorer-lock")
			const selectionChanged = tr.selection.from !== state.selection.from || tr.selection.to !== state.selection.to
			if (preventInterference && selectionChanged && !fromPlugin) {
				if (debug) handleDebug(debug, "prevented transaction", { tr, state, fromPlugin, selectionChanged })
				return false
			}
			if (debug) handleDebug(debug, "allowed transaction", { tr, state, fromPlugin, selectionChanged })

			return true
		},
		// @ts-expect-error todo
		appendTransaction(trs: readonly Transaction[], oldState: EditorState, newState: EditorState): Transaction {
			let tr: Transaction | undefined

			// user is undoing
			// see apply above for why this needed
			// let is_undo = trs.find(tr => tr.getMeta("history$")) !== undefined

			if (undoDepth(oldState) !== undoDepth(newState)) {
				const pluginOldState = key.getState(oldState)
				if (pluginOldState) {
					tr = newState.tr
					const { from, to } = pluginOldState
					tr.setSelection(TextSelection.create(tr.doc, from, to))
					// just in case
					// tr.setMeta("addToHistory", true)
					// closeHistory(tr)
					if (debug) handleDebug(debug, "restoring selection after undo", { tr, oldState, newState })
					return tr
				}
			}

			if (dropped) {
				if (prevSelection !== undefined) {
					const { from: prevFrom, to: prevTo } = prevSelection

					tr = newState.tr
					tr.setMeta(key, true)
					// just in case
					// tr.setMeta("addToHistory", false)
					// closeHistory(tr)

					const didNotDrag = trs.find(_ => _.getMeta(DID_NOT_DRAG)) !== undefined

					// see mousedown listener, it's possible for the user to click the handle but never drag
					// so we should just restore the selection to the previous positions, regardless of what it was
					if (didNotDrag) {
						if (debug) handleDebug(debug, "restoring selection after NOT dragging", { tr, oldState, newState })
						tr.setSelection(TextSelection.create(tr.doc, prevFrom, prevTo))
					} else {
						// prev node position, NOT current
						const { from: nodeStart, to: nodeEnd } = oldState.selection
						const { from: dropStart, to: dropEnd } = newState.selection

						if (prevFrom > nodeStart && prevTo < nodeEnd) {
							const startOffset = prevFrom - nodeStart
							const endOffset = prevTo - nodeStart
							// selection was inside node, restore
							if (debug) handleDebug(debug, "restoring selection", { tr, oldState, newState, offset })

							tr.setSelection(TextSelection.create(tr.doc, offset + dropStart + startOffset, offset + dropStart + endOffset))
						} else {
							if (debug) handleDebug(debug, "restoring selection using fallback", { tr, oldState, newState })
							// selection was NOT inside node, restore as configured
							switch (fallback) {
								case "select": tr = undefined; break
								case "end":
									tr.setSelection(TextSelection.create(tr.doc, offset + dropEnd))
									break
								case "start":
									tr.setSelection(TextSelection.create(tr.doc, offset + dropStart))
									break
								default: // function
									// @ts-expect-error WhAtTt
									tr.setSelection(TextSelection.create(tr.doc, ...fallback(prevSelection, offset, oldState, newState)))
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
				mousedown(view: EditorView, e: TaggedEvent_DragSelectionRestorer<MouseEvent>) {
					if (e[restoreSelection] !== undefined) {
						if (debug) handleDebug(debug, "saving selection", { selection: e[restoreSelection] })

						if (alreadySaved) {
							throw new Error("Tagged mouseup event firing multiple times. This probably means multiple node views are trying to save a selection. This can happen when the elements are nested, if we don't correctly check we only fire on that element's handle and not it's children's too.")
						}
						alreadySaved = true
						prevSelection = e[restoreSelection]!
						offset = e[restoreOffset] ?? 0
						preventInterference = true
						if (className !== "") view.dom.classList.add(className)
					}
					return false
				},
				dragstart() {
					setTimeout(() => {
						// we still need this to be true when filterTransactions is called next
						// that's the transaction we want to prevent
						preventInterference = false
					}, 0)
					return false
				},
				// it's possible the user clicked on the handle without dragging it
				// in which case, drop will never fire and appendTransaction will do nothing unless we intervene
				mouseup(view: EditorView) {
					if (prevSelection) {
						if (debug) handleDebug(debug, "mouseup (did not drag)")
						if (className !== "") view.dom.classList.remove(className)
						dropped = true
						alreadySaved = false
						setTimeout(() => {
							// same problem as in dragstart
							preventInterference = false
						}, 0)
						// force appendTransaction to fire
						const tr = view.state.tr
						// allow this transaction to bypass filterTransactions (since preventInterference will still be true)
						tr.setMeta(DID_NOT_DRAG, true)
						tr.setMeta("bypass-drag-selection-restorer-lock", true)
						view.dispatch(tr)
					}
					return false
				},
			},
			handleDrop(view: EditorView) {
				if (debug) handleDebug(debug, "drop (dragged)")
				if (className !== "") view.dom.classList.remove(className)
				dropped = true
				alreadySaved = false
				return false
			},
		},
	})
}
