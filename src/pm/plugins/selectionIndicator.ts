/* eslint-disable @typescript-eslint/no-use-before-define */
 
import { capitalize, debounce, keys } from "@alanscodelog/utils"
import type { Node, NodeType, ResolvedPos } from "prosemirror-model"
import { type EditorState, Plugin, PluginKey, TextSelection, type Transaction } from "prosemirror-state"
import { Decoration, DecorationSet, type EditorView } from "prosemirror-view"

// eslint-disable-next-line camelcase
import { restoreOffset, restoreSelection, type TaggedEvent_DragSelectionRestorer } from "./dragSelectionRestorer.js"
import { styleElement } from "./styleElement.js"

import type { FullHandleOptions, HandleOptions, PluginListeners, Rect } from "../types.js"
import { findEqualLevelNodes } from "../utils/findEqualLevelNodes.js"
import { nodesBetween } from "../utils/nodesBetween.js"


type SelectionIndicatorListeners = PluginListeners<"mousedown" | "mousemove" | "dragend">
/**
 * Given a node type and a class to set, calculates an "equal level selections" (the types of selections {@link moveListUp}/{@link moveListDown} move, see {@link findEqualLevelNodes}) and decorates those nodes.
 *
 * @param opts.type The node type of the items.
 * @param opts.className The class name to use, `[SCHEMA TYPE NAME]-selected` by default.
 * @param opts.ignore Allows filtering of nodes. If it returns true, no decorations are set for that node. If it returns a string, it uses that as the class name/s instead of the `className` option.
 *
 * @param opts.handle This plugin also optionally supports showing a handle element if this option is passed. It will select the "equal level selection" on mousedown for dragging. See {@link HandleOptions}
 *
 * ## Meta Properties
 *
 * `hide-selection-indicator-[type.name]` - Removes all decorations for the transaction.
 * `ignore-selection-indicator-[type.name]` - Ignores the transaction, returns the same decorations.
 */
export function selectionIndicator(
	{
		type,
		className = `${type.name}-selected`,
		handle,
		ignore,
	}: {
		type: NodeType
		className?: string
		handle?: HandleOptions | undefined
		ignore?: ((tr: Transaction, $start: ResolvedPos, $end: ResolvedPos, node: Node, pos: number, className: string) => boolean | string | void | undefined)
	}): Plugin {
	if (handle) {
		handle.classes ??= {}
		;(["handle", "fade_in", "hover", "dropped", "view_hover", "multiroot"] as const).forEach(name => {
			handle.classes![name] = handle.classes![name] ?? `${name === "view_hover" ? `view-hover-${handle.classes!.handle ?? ""}` : ""}${name.replace("_", "-")}`
		})
		handle.hoverDelay ??= 100
	}
	const key = new PluginKey(`selection-indicator-${type.name}`)
	// we must be able to tag from the node view the mousedown prosemirror handles so that the selection restorer will see the tag
	const listeners: SelectionIndicatorListeners = {
		// there shouldn't be more than one node view at a time, but just in case it's an array
		mousedown: [],
		mousemove: [],
		dragend: [],
	}
	return new Plugin<DecorationSet>({
		key,
		view: handle ? function(view: EditorView) {
			return new Handle(view, listeners, type, key, handle as FullHandleOptions)
		} : undefined,
		state: {
			init() { return DecorationSet.empty},
			apply(tr: Transaction, set: DecorationSet) {
				if (tr.getMeta(`ignore-selection-indicator-${type.name}`)) {
					return set
				}
				if (tr.getMeta(`hide-selection-indicator-${type.name}`)) {
					return DecorationSet.empty
				}

				const selection = tr.selection

				const { $start, $end } = findEqualLevelNodes(tr.doc, selection, type)

				const prevDecos = set.find()
				// might happen if something sets the selection to a weird place?
				if (!$start || !$end) return DecorationSet.empty

				// they are always set from first to last and it doesn't matter if prev_end is prev start
				// so this should work find
				// let prev_start = prevDecos[0]?.from
				// let prev_end = prevDecos[prevDecos.length - 1]?.to

				// let same_as_prev = $start.start() - 1 === prev_start && $end.end() + 1 === prev_end

				// if (!same_as_prev) {
				set = set.remove(prevDecos)
				const decos: Decoration[] = []
				nodesBetween(tr.doc, $start, $end, (node, pos) => {
					if (node?.type === type) {
						const ignored = ignore?.(tr, $start!, $end!, node, pos, className)
						let finalClassName = className
						if (ignored === true) {
							return false
						} else if (typeof ignored === "string") {
							finalClassName = ignored
						}
						const deco = Decoration.node(pos - 1, pos + node.nodeSize - 1, {
							class: finalClassName,
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
			decorations(state: EditorState) {
				return this.getState(state)
			},
			handleDOMEvents: {
				mousedown(_view: EditorView, e: MouseEvent) {
					listeners.mousedown.forEach(listener => listener(e))
					return false
				},
				mousemove(_view: EditorView, e: MouseEvent) {
					listeners.mousemove.forEach(listener => listener(e))
					return false
				},
				dragend(_view: EditorView, e: MouseEvent) {
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

	lastDecos: Decoration[]

	key: PluginKey

	rect: Rect | undefined

	boundMousedown: (...args: any[]) => any

	boundMousemove: (...args: any[]) => any

	boundDragend: (...args: any[]) => any

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
		this.lastDecos = key.getState(view.state)
		this.boundMousemove = debounce(this.mousemove.bind(this), 10)
		this.boundMousedown = this.mousedown.bind(this)
		this.boundDragend = this.dragend.bind(this)
		keys(this.listeners).forEach(name => {
			listeners[name].push((this as any)[`bound${capitalize(name)}`])
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
			const index = this.listeners[name].indexOf((this as any)[`bound_${name}`])
			if (index === -1) { return }
			this.listeners[name].splice(index, 1)
		})
	}

	update(view: EditorView, viewState: EditorState): void {
		const prevDecos = this.key.getState(viewState)
		const state = this.key.getState(view.state)
		// console.log({ prev_rect, state })
		if (!state.eq(prevDecos)) {
			this.lastDecos = state.find()
			this.updateHandle(this.lastDecos)
		}
	}

	updateHandle(decos: Decoration[]): void {
		const positions = this.getPositions(decos)

		if (!positions) { this.remove(); return }
		const { first, last } = positions

		let crossesRoot = false
		const $first = this.view.state.doc.resolve(first + 1)
		const minLevel = $first.node().attrs.level
		this.view.state.doc.nodesBetween(first, last, (node, pos) => {
			if (node.type === this.type && pos !== first && pos !== last) {
				if (node.attrs.level === minLevel) crossesRoot = true
				return false
			}
			return true
		})

		this.add(crossesRoot)
		const firstEl: HTMLElement = this.view.nodeDOM(first) as HTMLElement
		const lastEl: HTMLElement = this.view.nodeDOM(last) as HTMLElement
		if (!firstEl || !lastEl) { return } // should not happen
		const firstInfo = firstEl.getBoundingClientRect()
		const lastInfo = lastEl.getBoundingClientRect()
		const rect: Rect = {
			top: firstInfo.top,
			left: firstInfo.left,
			height: lastInfo.bottom - firstInfo.top,
		}

		styleElement(this.container, rect, this.element)
	}

	clearPosition(): void {
		(["top", "left", "height"] as const).forEach(key => {
			this.element.style[key] = ""
		})
	}

	remove(): void {
		this.element.classList.remove(this.opts.classes.fade_in)
		this.timeout = setTimeout(() => {
			this.element.remove()
			this.clearPosition()
		}, this.opts.hoverDelay)
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

	getPositions(decos: Decoration[], to: boolean = false): { first: number, last: number } | undefined {
		if (decos.length === 0) { return }
		const startDecos = decos.filter(deco => this.opts.start(deco))
		if (startDecos.length === 0) { return }
		const first = startDecos[0].from
		const endDecos = decos.filter(deco => this.opts.end(deco))
		if (endDecos.length === 0) { return }
		const last = endDecos[endDecos.length - 1][to ? "to" : "from"]
		return { first, last }
	}

	contained(e: MouseEvent): boolean {
		const rect = this.element.getBoundingClientRect()
		return e.clientX > rect.left &&
			e.clientX < rect.right &&
			e.clientY > rect.top &&
			e.clientY < rect.bottom
	}

	mousedown(e: MouseEvent): boolean | void {
		if (this.contained(e)) {
			const decos = this.lastDecos
			const positions = this.getPositions(decos, true)
			if (!positions) { e.preventDefault(); return }
			const { first, last } = positions
			// eslint-disable-next-line camelcase
			const tr = this.view.state.tr; (e as TaggedEvent_DragSelectionRestorer<typeof e>)[restoreSelection] = this.view.state.selection; (e as TaggedEvent_DragSelectionRestorer<typeof e>)[restoreOffset] = -2
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

	dragend(): void {
		// console.log("dragend")

		// don't make it move when dropped, but let it appear instead
		this.clearPosition()
		this.element.remove()
		this.element.classList.add(this.opts.classes.dropped)
		setTimeout(() => {
			this.updateHandle(this.key.getState(this.view.state).find())
		})
	}
}
