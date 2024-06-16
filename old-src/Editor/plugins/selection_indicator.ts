/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/naming-convention */
import { debounce, keys } from "@alanscodelog/utils"
import type { Node, NodeType, ResolvedPos } from "prosemirror-model"
import { EditorState, Plugin, PluginKey, TextSelection, Transaction } from "prosemirror-state"
import { Decoration, DecorationSet, EditorView } from "prosemirror-view"

import { style_element } from "@/components/Editor//plugins/style_element"
import { restore_offset, restore_selection, TaggedEvent_DragSelectionRestorer } from "@/components/Editor/plugins/drag_selection_restorer"
import type { FullHandleOptions, HandleOptions, PluginListeners, Rect } from "@/components/Editor/types"
import { find_equal_level_nodes, nodes_between } from "@/components/Editor/utils"

import { debug_node } from "../dev_utils"


type SelectionIndicatorListeners = PluginListeners<"mousedown" | "mousemove" | "dragend">
/**
 * Given a node type and a class to set, calculates an "equal level selections" (the types of selections {@link move_list_up}/{@link move_list_down} move, see {@link find_equal_level_nodes}) and decorates those nodes.
 *
 * @param opts.type - The node type of the items.
 * @param opts.class_name - The class name to use, `[SCHEMA TYPE NAME]-selected` by default.
 * @param opts.ignore - Allows filtering of nodes. If it returns true, no decorations are set for that node. If it returns a string, it uses that as the class name/s instead of the `class_name` option.
 *
 * @param opts.handle - This plugin also optionally supports showing a handle element if this option is passed. It will select the "equal level selection" on mousedown for dragging. See {@link HandleOptions}
 *
 * ## Meta Properties
 *
 * `hide-selection-indicator-[type.name]` - Removes all decorations for the transaction.
 * `ignore-selection-indicator-[type.name]` - Ignores the transaction, returns the same decorations.
 *
 */
export function selection_indicator(
	{
		type,
		class_name = `${type.name}-selected`,
		handle,
		ignore,
	}: {
		type: NodeType
		class_name?: string
		handle?: HandleOptions|undefined
		ignore?: ((tr: Transaction, $start: ResolvedPos, $end: ResolvedPos, node: Node, pos: number, className: string) => boolean |string | void | undefined)
	}): Plugin {
	if (handle) {
		handle.classes = handle.classes ?? {}
		;(["handle", "fade_in", "hover", "dropped", "view_hover", "multiroot"] as const).forEach(name => {
			handle.classes![name] = handle.classes![name] ?? `${name === "view_hover" ? `view-hover-${handle.classes!.handle}` : ""}${name.replace("_", "-")}`
		})
		handle.hover_delay = handle.hover_delay ?? 100
	}
	let key = new PluginKey(`selection-indicator-${type.name}`)
	// we must be able to tag from the node view the mousedown prosemirror handles so that the selection restorer will see the tag
	let listeners: SelectionIndicatorListeners = {
		// there shouldn't be more than one node view at a time, but just in case it's an array
		mousedown: [],
		mousemove: [],
		dragend: [],
	}
	return new Plugin<DecorationSet>({
		key,
		view: handle ? function(view) {
			return new Handle(view, listeners, type, key, handle as FullHandleOptions)
		} : undefined,
		state: {
			init() { return DecorationSet.empty},
			apply(tr, set) {
				if (tr.getMeta(`ignore-selection-indicator-${type.name}`)) {
					return set
				}
				if (tr.getMeta(`hide-selection-indicator-${type.name}`)) {
					return DecorationSet.empty
				}

				let selection = tr.selection

				let { $start, $end } = find_equal_level_nodes(tr.doc, selection, type)

				let prev_decos = set.find()
				// might happen if something sets the selection to a weird place?
				if (!$start || !$end) return DecorationSet.empty

				// they are always set from first to last and it doesn't matter if prev_end is prev start
				// so this should work find
				// let prev_start = prev_decos[0]?.from
				// let prev_end = prev_decos[prev_decos.length - 1]?.to

				// let same_as_prev = $start.start() - 1 === prev_start && $end.end() + 1 === prev_end

				// if (!same_as_prev) {
				set = set.remove(prev_decos)
				let decos: Decoration[] = []
				nodes_between(tr, $start, $end, (node, pos) => {
					if (node.type === type) {
						let ignored = ignore?.(tr, $start!, $end!, node, pos, class_name)
						let final_class_name = class_name
						if (ignored === true) {
							return false
						} else if (typeof ignored === "string") {
							final_class_name = ignored
						}
						let deco = Decoration.node(pos - 1, pos + node.nodeSize - 1, {
							class: final_class_name,
						}, { type: `selection-indicator-${type.name}` },
						)
						decos.push(deco)
						return false
					} else return true
				})
				set = set.add(tr.doc, decos)
				return set
				// }
				// selection changed but start/end points are the same
				// return the same decorations mapped to any new changes
				// return set.map(tr.mapping, tr.doc)
			},
		},
		props: {
			decorations(state) {
				return this.getState(state)
			},
			handleDOMEvents: {
				mousedown(_view, e) {
					listeners.mousedown.forEach(listener => listener(e))
					return false
				},
				mousemove(_view, e) {
					listeners.mousemove.forEach(listener => listener(e))
					return false
				},
				dragend(_view, e) {
					listeners.dragend.forEach(listener => listener(e))
					return false
				},
			},
		},
	})
}

export class Handle {
	view: EditorView
	timeout?: number | NodeJS.Timeout
	type: NodeType
	container: HTMLElement
	element: HTMLElement
	last_decos: Decoration[]
	key: PluginKey
	rect: Rect | undefined
	bound_mousedown: (...args: any[]) => any
	bound_mousemove: (...args: any[]) => any
	bound_dragend: (...args: any[]) => any
	listeners: SelectionIndicatorListeners
	opts: FullHandleOptions
	constructor(
		view: EditorView,
		listeners: SelectionIndicatorListeners,
		type: NodeType,
		key: PluginKey,
		opts: FullHandleOptions,
	) {
		this.view = view
		this.listeners = listeners
		this.type = type
		this.key = key
		this.opts = opts
		this.container = this.opts.container
		this.last_decos = key.getState(view.state)
		this.bound_mousemove = debounce(this.mousemove.bind(this), 10)
		this.bound_mousedown = this.mousedown.bind(this)
		this.bound_dragend = this.dragend.bind(this)
		keys(this.listeners).forEach(name => {
			listeners[name].push((this as any)[`bound_${name}`])
		})
		this.element = document.createElement("div")
		this.element.classList.add(this.opts.classes.handle)
		this.element.style.cssText = `
		position: absolute;
		pointer-events:none;
		z-index: 1;
		`
	}
	destroy(): void {
		keys(this.listeners).forEach(name => {
			let index = this.listeners[name].indexOf((this as any)[`bound_${name}`])
			if (index === -1) { return }
			this.listeners[name].splice(index, 1)
		})
	}
	update(view: EditorView, view_state: EditorState): void {
		let prev_decos = this.key.getState(view_state)
		let state = this.key.getState(view.state)
		// console.log({ prev_rect, state })
		if (!state.eq(prev_decos)) {
			this.last_decos = state.find()
			this.update_handle(this.last_decos)
		}
	}
	update_handle(decos: Decoration[]): void {
		let positions = this.get_positions(decos)

		if (!positions) { this.remove(); return }
		let { first, last } = positions

		let crosses_root = false
		let $first = this.view.state.doc.resolve(first + 1)
		let min_level = $first.node().attrs.level
		this.view.state.doc.nodesBetween(first, last, (node, pos) => {
			if (node.type === this.type && pos !== first && pos !== last) {
				if (node.attrs.level === min_level) crosses_root = true
				return false
			}
		})

		this.add(crosses_root)
		let first_el: HTMLElement = this.view.nodeDOM(first) as HTMLElement
		let last_el: HTMLElement = this.view.nodeDOM(last) as HTMLElement
		if (!first_el || !last_el) { return } // should not happen
		let first_info = first_el.getBoundingClientRect()
		let last_info = last_el.getBoundingClientRect()
		let rect: Rect = {
			top: first_info.top,
			left: first_info.left,
			height: last_info.bottom - first_info.top,
		}

		style_element(this.container, rect, this.element)
	}
	clear_position(): void {
		(["top", "left", "height"] as const).forEach(key => {
			this.element.style[key] = ""
		})
	}
	remove(): void {
		this.element.classList.remove(this.opts.classes.fade_in)
		this.timeout = setTimeout(() => {
			this.element.remove()
			this.clear_position()
		}, this.opts.hover_delay)
	}
	add(multiroot: boolean = false): void {
		clearTimeout(this.timeout as number)
		if (multiroot) this.element.classList.add(this.opts.classes.multiroot)
		else this.element.classList.remove(this.opts.classes.multiroot)
		if (!this.container.contains(this.element)) {
			this.element.remove()
			this.element.classList.remove(this.opts.classes.fade_in)
			this.container.prepend(this.element)
			setTimeout(() => {
				this.element.classList.add(this.opts.classes.fade_in)
				this.element.classList.remove(this.opts.classes.dropped)
			})
		} else {
			this.element.classList.add(this.opts.classes.fade_in)
		}
	}
	get_positions(decos: Decoration[], to: boolean = false): { first: number, last: number } | undefined {
		if (decos.length === 0) { return }
		let start_decos = decos.filter(deco => this.opts.start(deco))
		if (start_decos.length === 0) { return }
		let first = start_decos[0].from
		let end_decos = decos.filter(deco => this.opts.end(deco))
		if (end_decos.length === 0) { return }
		let last = end_decos[end_decos.length - 1][to ? "to" : "from"]
		return { first, last }
	}
	contained(e: MouseEvent): boolean {
		let rect = this.element.getBoundingClientRect()
		return e.clientX > rect.left &&
			e.clientX < rect.right &&
			e.clientY > rect.top &&
			e.clientY < rect.bottom
	}
	mousedown(e: MouseEvent): boolean | void {
		if (this.contained(e)) {
			let decos = this.last_decos
			let positions = this.get_positions(decos, true)
			if (!positions) { e.preventDefault(); return }
			let { first, last } = positions
			let tr = this.view.state.tr; (e as TaggedEvent_DragSelectionRestorer<typeof e>)[restore_selection] = this.view.state.selection; (e as TaggedEvent_DragSelectionRestorer<typeof e>)[restore_offset] = -2
			if (this.opts.modify) { this.opts.modify(tr) }
			tr.setSelection(TextSelection.create(tr.doc, first, last - 2))
			tr.setMeta(`ignore-selection-indicator-${this.type.name}`, true)
			this.view.dispatch(tr)
		}
		return false
	}
	mousemove(e: DragEvent): void {
		if (this.element.parentElement && this.contained(e)) {
			this.element.classList.add(this.opts.classes.hover)
			this.view.dom.classList.add(this.opts.classes.view_hover)
		} else {
			this.element.classList.remove(this.opts.classes.hover)
			this.view.dom.classList.remove(this.opts.classes.view_hover)
		}
	}
	dragend() {
		console.log("dragend")

		// don't make it move when dropped, but let it appear instead
		this.clear_position()
		this.element.remove()
		this.element.classList.add(this.opts.classes.dropped)
		setTimeout(() => {
			this.update_handle(this.key.getState(this.view.state).find())
		})
	}
}
