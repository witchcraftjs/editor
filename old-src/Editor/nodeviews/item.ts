/* eslint-disable @typescript-eslint/naming-convention */
import { DOMSerializer, Node, Node as ProsemirrorNode, NodeType } from "prosemirror-model"
import { TextSelection } from "prosemirror-state"
import type { Decoration, EditorView, NodeView } from "prosemirror-view"
import { App, createApp } from "vue"

import ContextMenu from "@/components/Editor/ContextMenu.vue"
import { debug_node } from "@/components/Editor/dev_utils"
import { restore_offset, restore_selection, TaggedEvent_DragSelectionRestorer } from "@/components/Editor/plugins/drag_selection_restorer"
import { schema } from "@/components/Editor/schema"
import type { TaggedEvent } from "@/components/Editor/types"
import { find_equal_level_nodes } from "@/components/Editor/utils"


let handle_is_being_dragged = false
export class Item implements NodeView {
	prev_content: string | undefined
	last_classes: string ="not-selected"
	dom: HTMLLIElement
	contentDOM: HTMLDivElement
	type: NodeType
	child_type: NodeType
	level: number
	view: EditorView
	get_pos: () => number
	handle_inner: HTMLDivElement
	type_handle: HTMLDivElement
	handles: HTMLDivElement
	menu_container: HTMLDivElement
	menu?: App<HTMLDivElement>
	menu_root?: HTMLDivElement
	// container!: HTMLDivElement
	dragging: boolean = false
	/**
	 * See `ignore_mutation`. Also careful, never add `selection` to this when the user might be dragging a selection, it might cause a selection change to be shown but not registered by prosemirror because we might confuse the external mutation for ours.
	 */
	possible_mutations = ["childList", "attributes"]
	/**
	 * This along with `possible_mutations` allows us to more accurately ignore our own mutations.
	 * Anytime the dom or any element in the dom is changed (while they are "mounted"), this should be increased.
	 * Elements to be added should if possible be modified (e.g. classes added) before inserting them so as to only trigger less mutations and make problems easier to debug.
	 */
	ignore_mutation = 0
	timeout: number
	constructor(type: NodeType, node: ProsemirrorNode, view: EditorView, get_pos: boolean | (() => number), decos: Decoration[]) {
		this.view = view
		this.type = type
		this.get_pos = get_pos as () => number
		this.level = node.attrs.level
		let { dom, contentDOM } = DOMSerializer.renderSpec(document, type.spec.toDOM!(node))
		this.dom = dom as HTMLLIElement
		this.contentDOM = contentDOM! as HTMLDivElement
		this.child_type = node.firstChild!.type

		this.menu_container = this.view.dom.parentElement as HTMLDivElement
		this.handles = document.createElement("div")
		this.handles.setAttribute("contenteditable", "false")
		this.handles.classList.add("handles")

		this.handle_inner = document.createElement("div")
		this.handle_inner.setAttribute("contenteditable", "false")
		this.handle_inner.tabIndex = -1
		this.handle_inner.classList.add("handle-inner")
		let found_inner = this.check_decos([`selection-indicator-${this.type.name}`], [`${this.type.name}-selected`, `${this.type.name}-selected-single`], decos, undefined, true)

		this.type_handle = document.createElement("div")
		this.type_handle.setAttribute("contenteditable", "false")
		this.type_handle.classList.add("item-type")
		// setInterval(() => console.log(this.menu), 100)
		this.timeout = setTimeout(() => {
			this.dom.prepend(this.handles)
			this.ignore_mutation++
			this.handles.prepend(this.type_handle)
			this.check_type_height()
			this.ignore_mutation++

			if (found_inner) {
				this.handle_inner.classList.add("fade-in")
				this.handles.insertBefore(this.handle_inner, this.type_handle.nextSibling)
				this.ignore_mutation++
			} else {
				this.handle_inner.remove()
				this.ignore_mutation++
			}
		}, 50) as any as number
	}
	check_type_height(): void {
		setTimeout(() => {
			let container = this.dom.querySelector("*:not(.handles):not(.handle-inner):not(.item-type)") as HTMLDivElement
			if (!container) return
			let line_height = window.getComputedStyle(container).lineHeight

			if (parseInt(line_height.replace("px", ""), 10) <= container.getBoundingClientRect().height) {
				this.type_handle.classList.add("multiline")
				this.ignore_mutation++
				let bullet = window.getComputedStyle(this.type_handle, "::before").height
				line_height = `calc((${line_height} / 2) + ${bullet} / 2)`
			} else {
				this.type_handle.classList.remove("multiline")
				this.ignore_mutation++
			}
			this.type_handle.style.height = line_height
		})
	}
	destroy(): void {
		clearTimeout(this.timeout)
		console.log("destroy")

		this.remove_menu()
	}
	check_decos(types: string[] | undefined, classNames: string[] | undefined, decos: Decoration[], el: undefined, only_found?: true): Decoration
	check_decos(types: string[] | undefined, classNames: string[] | undefined, decos: Decoration[], el: Element, only_found?: false): Decoration
	check_decos(types: string[] | undefined, classNames: string[] | undefined, decos: Decoration[], el: Element | undefined, only_found: boolean = false): Decoration | void {
		let found = decos.find(deco => {
			let type = (deco as any).type.spec.type
			let className = (deco as any).type.attrs.class

			return (!types || types.includes(type)) && (!classNames || classNames.includes(className))
		})

		if (only_found) return found

		if (found !== undefined) {
			if (!this.handles.contains(el!)) {
				el!.classList.remove("fade-in")
				this.handles.insertBefore(el!, this.type_handle.nextSibling)
				this.ignore_mutation++
				setTimeout(() => {
					el!.classList.add("fade-in")
					this.ignore_mutation++
				}, 10)// not 100% sure why it needs a small delay
			}
		} else {
			if (this.handles.contains(el!)) {
				el!.classList.remove("fade-in")
				el!.remove()
				this.ignore_mutation++
			}
		}
	}
	update(node: Node, decos: Decoration[]): boolean {
		if (this.menu) {
			this.menu.config.globalProperties.pm.node = node
		}
		if (node.type !== schema.nodes.item) return false
		if (node.firstChild!.type !== this.child_type) {
			this.remove_menu()
			return false
		}
		if (node.attrs.level !== this.level) {
			this.level = node.attrs.level
			this.dom.setAttribute("level", this.level.toString())
			this.ignore_mutation++
		}
		// selected-inside so we show the handle if the selection is completely inside the node
		this.check_decos(undefined, [`${this.type.name}-hover`, `${this.type.name}-selected ${this.type.name}-selected-inside`], decos, this.handle_inner)
		this.check_type_height() // todo on change only
		return true
	}
	ignoreMutation(record: MutationRecord | { type: "selection", target: Element }): boolean {
		if (this.possible_mutations.includes(record.type) && this.ignore_mutation > 0) {
			this.ignore_mutation--
			return true
		}
		if (record.target === this.menu_root || this.menu_root?.contains(record.target)) {
			return true
		}

		if ((record.target as Element)?.classList.contains("handle-inner") &&
			record.type === "attributes" &&
			record.addedNodes.length === 0 &&
			record.addedNodes.length === 0) return true
		return false
	}
	add_menu(): void {
		this.menu_root = document.createElement("div")
		this.menu_root.classList.add("menu")
		this.menu = createApp(ContextMenu) as App<HTMLDivElement>
		this.menu.config.globalProperties.destroy = this.remove_menu.bind(this)
		this.menu.config.globalProperties.pm = {
			view: this.view,
			node: this.view.state.doc.resolve(this.get_pos() + 1).node(),
			get_pos: this.get_pos,
			destroy: () => this.remove_menu(),
		}
		this.menu_container.prepend(this.menu_root)
		this.menu.mount(this.menu_root)
		this.ignore_mutation++
	}
	remove_menu(): void {
		if (this.menu && this.menu_root) {
			console.log("removed")
			this.menu.unmount(this.menu_root)
			this.menu = undefined
			this.menu_root.remove()
			this.menu_root = undefined
			this.ignore_mutation++
		}
	}
	stopEvent(e: Event): boolean {
		// we can't mess with how the event is handled outside of here, but we don't personally want to handle it again
		if ((e as TaggedEvent<typeof e>)[restore_selection]) {
			return false
		}

		if (e instanceof DragEvent && handle_is_being_dragged) {
			if (e.type === "dragover") {
				if (this.view.dragging) {
					(this.view.dragging as any).overrideMove = true
				}
			}
			if (e.type === "drop") {
				handle_is_being_dragged = false
			}
		}

		if (e instanceof MouseEvent) {
			let el = e.target as HTMLDivElement

			let clicking_inner_handle = this.handles === el || this.handles.contains(el)
			let clicking_content = !clicking_inner_handle

			if (clicking_content && !handle_is_being_dragged && e.type !== "dragend" && e.type.includes("drag")) {
				e.preventDefault()
				return true
			} else if (clicking_inner_handle) { // clicking handle
				if ((e.button === 2 && e.type === "contextmenu") || (e.button === 0 && e.type === "mousedown" && !handle_is_being_dragged)) {
					e.preventDefault()
					this.add_menu()
					return true
				}
				if (e.button === 0 && e.type === "mouseup") {
					handle_is_being_dragged = false
				}
				// mousedown on the handle (fires before dragstart)
				if (e.button === 0 && e.type === "mousedown") {
					handle_is_being_dragged = true
					// see plugin for details
					// eslint-disable-next-line @typescript-eslint/no-extra-semi
					; (e as TaggedEvent<typeof e>)[restore_selection] = this.view.state.selection

					// force the selection to be within the node and it's children
					let start = this.get_pos()
					let $node = this.view.state.doc.resolve(start + 1)

					let { $start, $end } = find_equal_level_nodes(this.view.state.doc, { $from: $node, $to: $node }, schema.nodes.item)
					if ($start && $end) {
						let tr = this.view.state.tr
						tr.setMeta(`selection-indicator-${this.type.name}`, TextSelection.create(tr.doc, $start?.start(), $end?.end()))
						tr.setMeta("ignore-unfocused-selection", true)
						// the plugin also needs to be notified to shift the selection being restored
						// eslint-disable-next-line @typescript-eslint/no-extra-semi
						; (e as TaggedEvent_DragSelectionRestorer<typeof e>)[restore_offset] = -2
						tr.setSelection(TextSelection.create(tr.doc, $start?.start() - 1, $end?.end() - 1))
						this.view.dispatch(tr)
						return false
					} else {
						throw new Error("should not happen")
					}
				}
			}
		}
		return false
	}
}
