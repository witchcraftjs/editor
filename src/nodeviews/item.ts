/* eslint-disable @typescript-eslint/naming-convention */
import { DOMSerializer, type Node, type Node as ProsemirrorNode, type NodeType } from "prosemirror-model"
import { TextSelection } from "prosemirror-state"
import type { Decoration, EditorView, NodeView } from "prosemirror-view"
import { type App /* createApp  */ } from "vue"

// import ContextMenu from "/ContextMenu.vue"
// eslint-disable-next-line camelcase
import { restoreOffset, restoreSelection, type TaggedEvent_DragSelectionRestorer } from "../plugins/dragSelectionRestorer.js"
import { schema } from "../schema.js"
import type { TaggedEvent } from "../types.js"
import { findEqualLevelNodes } from "../utils/findEqualLevelNodes.js"


let handleIsBeingDragged = false
export class Item implements NodeView {
	prevContent: string | undefined

	lastClasses: string = "not-selected"

	dom: HTMLLIElement

	contentDOM: HTMLDivElement

	type: NodeType

	childType: NodeType

	level: number

	view: EditorView

	getPos: () => number | undefined

	handleInner: HTMLDivElement

	typeHandle: HTMLDivElement

	handles: HTMLDivElement

	menuContainer: HTMLDivElement

	menu?: App<HTMLDivElement>

	menuRoot?: HTMLDivElement

	// container!: HTMLDivElement
	dragging: boolean = false

	/**
	 * See `ignoreMutation`. Also careful, never add `selection` to this when the user might be dragging a selection, it might cause a selection change to be shown but not registered by prosemirror because we might confuse the external mutation for ours.
	 */
	possibleMutations: string[] = ["childList", "attributes"]

	/**
	 * This along with `possibleMutations` allows us to more accurately ignore our own mutations.
	 * Anytime the dom or any element in the dom is changed (while they are "mounted"), this should be increased.
	 * Elements to be added should if possible be modified (e.g. classes added) before inserting them so as to only trigger less mutations and make problems easier to debug.
	 */
	_ignoreMutation: number = 0

	timeout: number

	constructor(
		type: NodeType,
		node: ProsemirrorNode,
		view: EditorView,
		getPos: () => number | undefined,
		decos: readonly Decoration[]
	) {
		this.view = view
		this.type = type
		this.getPos = getPos
		this.level = node.attrs.level
		const { dom, contentDOM } = DOMSerializer.renderSpec(document, type.spec.toDOM!(node))
		this.dom = dom as HTMLLIElement
		this.contentDOM = contentDOM! as HTMLDivElement
		this.childType = node.firstChild!.type

		this.menuContainer = this.view.dom.parentElement as HTMLDivElement
		this.handles = document.createElement("div")
		this.handles.setAttribute("contenteditable", "false")
		this.handles.classList.add("handles")

		this.handleInner = document.createElement("div")
		this.handleInner.setAttribute("contenteditable", "false")
		this.handleInner.tabIndex = -1
		this.handleInner.classList.add("handle-inner")
		const foundInner = this.checkDecos([`selection-indicator-${this.type.name}`], [`${this.type.name}-selected`, `${this.type.name}-selected-single`], decos, undefined, true)

		this.typeHandle = document.createElement("div")
		this.typeHandle.setAttribute("contenteditable", "false")
		this.typeHandle.classList.add("item-type")
		// setInterval(() => console.log(this.menu), 100)
		this.timeout = setTimeout(() => {
			this.dom.prepend(this.handles)
			this._ignoreMutation++
			this.handles.prepend(this.typeHandle)
			this.checkTypeHeight()
			this._ignoreMutation++

			if (foundInner) {
				this.handleInner.classList.add("fade-in")
				this.handles.insertBefore(this.handleInner, this.typeHandle.nextSibling)
				this._ignoreMutation++
			} else {
				this.handleInner.remove()
				this._ignoreMutation++
			}
		}, 50) as any as number
	}

	checkTypeHeight(): void {
		setTimeout(() => {
			const container = this.dom.querySelector("*:not(.handles):not(.handle-inner):not(.item-type)")!
			if (!container) return
			let lineHeight = window.getComputedStyle(container).lineHeight

			if (parseInt(lineHeight.replace("px", ""), 10) <= container.getBoundingClientRect().height) {
				this.typeHandle.classList.add("multiline")
				this._ignoreMutation++
				const bullet = window.getComputedStyle(this.typeHandle, "::before").height
				lineHeight = `calc((${lineHeight} / 2) + ${bullet} / 2)`
			} else {
				this.typeHandle.classList.remove("multiline")
				this._ignoreMutation++
			}
			this.typeHandle.style.height = lineHeight
		})
	}

	destroy(): void {
		clearTimeout(this.timeout)
		// console.log("destroy")

		this.removeMenu()
	}

	checkDecos(types: string[] | undefined, classNames: string[] | undefined, decos: readonly Decoration[], el: undefined, onlyFound?: true): Decoration

	checkDecos(types: string[] | undefined, classNames: string[] | undefined, decos: readonly Decoration[], el: Element, onlyFound?: false): Decoration

	checkDecos(types: string[] | undefined, classNames: string[] | undefined, decos: readonly Decoration[], el: Element | undefined, onlyFound: boolean = false): Decoration | void {
		const found = decos.find(deco => {
			const type = (deco as any).type.spec.type
			const className = (deco as any).type.attrs.class

			return (!types || types.includes(type)) && (!classNames || classNames.includes(className))
		})

		if (onlyFound) return found

		if (found !== undefined) {
			if (!this.handles.contains(el!)) {
				el!.classList.remove("fade-in")
				this.handles.insertBefore(el!, this.typeHandle.nextSibling)
				this._ignoreMutation++
				setTimeout(() => {
					el!.classList.add("fade-in")
					this._ignoreMutation++
				}, 10)// not 100% sure why it needs a small delay
			}
		} else {
			if (this.handles.contains(el!)) {
				el!.classList.remove("fade-in")
				el!.remove()
				this._ignoreMutation++
			}
		}
	}

	update(node: Node, decos: readonly Decoration[]): boolean {
		if (this.menu) {
			this.menu.config.globalProperties.pm.node = node
		}
		if (node.type !== schema.nodes.item) return false
		if (node.firstChild!.type !== this.childType) {
			this.removeMenu()
			return false
		}
		if (node.attrs.level !== this.level) {
			this.level = node.attrs.level
			this.dom.setAttribute("level", this.level.toString())
			this._ignoreMutation++
		}
		// selected-inside so we show the handle if the selection is completely inside the node
		this.checkDecos(undefined, [`${this.type.name}-hover`, `${this.type.name}-selected ${this.type.name}-selected-inside`], decos, this.handleInner)
		this.checkTypeHeight() // todo on change only
		return true
	}

	ignoreMutation(record: MutationRecord | { type: "selection", target: Element }): boolean {
		if (this.possibleMutations.includes(record.type) && this._ignoreMutation > 0) {
			this._ignoreMutation--
			return true
		}
		if (record.target === this.menuRoot || this.menuRoot?.contains(record.target)) {
			return true
		}

		if ((record.target as Element)?.classList.contains("handle-inner") &&
			record.type === "attributes" &&
			record.addedNodes.length === 0 &&
			record.addedNodes.length === 0) return true
		return false
	}

	addMenu(): void {
		this.menuRoot = document.createElement("div")
		this.menuRoot.classList.add("menu")
		// this.menu = createApp(ContextMenu) as App<HTMLDivElement>
		// this.menu.config.globalProperties.destroy = this.removeMenu.bind(this)
		// this.menu.config.globalProperties.pm = {
		// 	view: this.view,
		// 	node: this.view.state.doc.resolve(this.getPos() + 1).node(),
		// 	getPos: this.getPos,
		// 	destroy: () => this.removeMenu(),
		// }
		// this.menuContainer.prepend(this.menuRoot)
		// this.menu.mount(this.menuRoot)
		this._ignoreMutation++
	}

	removeMenu(): void {
		if (this.menu && this.menuRoot) {
			// console.log("removed")
			// this.menu.unmount(this.menuRoot)
			// this.menu = undefined
			// this.menuRoot.remove()
			// this.menuRoot = undefined
			this._ignoreMutation++
		}
	}

	stopEvent(e: Event): boolean {
		// we can't mess with how the event is handled outside of here, but we don't personally want to handle it again
		if ((e as TaggedEvent<typeof e>)[restoreSelection]) {
			return false
		}

		if (e instanceof DragEvent && handleIsBeingDragged) {
			if (e.type === "dragover") {
				if (this.view.dragging) {
					(this.view.dragging as any).overrideMove = true
				}
			}
			if (e.type === "drop") {
				handleIsBeingDragged = false
			}
		}

		if (e instanceof MouseEvent) {
			const el = e.target as HTMLDivElement

			const clickingInnerHandle = this.handles === el || this.handles.contains(el)
			const clickingContent = !clickingInnerHandle

			if (clickingContent && !handleIsBeingDragged && e.type !== "dragend" && e.type.includes("drag")) {
				e.preventDefault()
				return true
			} else if (clickingInnerHandle) { // clicking handle
				if ((e.button === 2 && e.type === "contextmenu") || (e.button === 0 && e.type === "mousedown" && !handleIsBeingDragged)) {
					e.preventDefault()
					this.addMenu()
					return true
				}
				if (e.button === 0 && e.type === "mouseup") {
					handleIsBeingDragged = false
				}
				// mousedown on the handle (fires before dragstart)
				if (e.button === 0 && e.type === "mousedown") {
					handleIsBeingDragged = true
					// see plugin for details
					
					; (e as TaggedEvent<typeof e>)[restoreSelection] = this.view.state.selection

					// force the selection to be within the node and it's children
					const start = this.getPos()
					if (start === undefined) return false // todo tocheck
					const $node = this.view.state.doc.resolve(start + 1)

					const { $start, $end } = findEqualLevelNodes(this.view.state.doc, { $from: $node, $to: $node }, schema.nodes.item)
					if ($start && $end) {
						const tr = this.view.state.tr
						tr.setMeta(`selection-indicator-${this.type.name}`, TextSelection.create(tr.doc, $start?.start(), $end?.end()))
						tr.setMeta("ignore-unfocused-selection", true)
						// the plugin also needs to be notified to shift the selection being restored
						// eslint-disable-next-line camelcase
						; (e as TaggedEvent_DragSelectionRestorer<typeof e>)[restoreOffset] = -2
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
