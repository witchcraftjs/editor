import { throttle } from "@alanscodelog/utils"
import type { NodeType, ResolvedPos } from "prosemirror-model"
import { type EditorState, Plugin, PluginKey, TextSelection, type Transaction } from "prosemirror-state"
import type { EditorView } from "prosemirror-view"

import { styleElement } from "./styleElement.js"

import { type Rect, SELF } from "../types"
import { conformSlice } from "../utils/conformSlice.js"
import { findNext } from "../utils/findNext.js"
import { getCursorDropLocation } from "../utils/getCursorDropLocation.js"
import { getDropLocation } from "../utils/getDropLocation.js"
import { findUp } from "../utils/old/findUp.js"


export function listFixer(
	{
		type,
		container,
	}: {
		type: NodeType
		container: HTMLElement
	}): Plugin {
	const key = new PluginKey("list-fixer")
	return new Plugin({
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		view(view: EditorView) { return new DragCursor(view, container, type, 2) },
		key,
		props: {
			handleDrop(view: EditorView, e: MouseEvent, slice: any /* todo */) {
				let $drop: ResolvedPos
				let dropLevel!: number
				let dropPos!: number
				const dropIsItem = true
				if (slice.openStart === 0) {
					const dropInfo = getDropLocation(view, e)

					if (!dropInfo) return true
					;({ $drop, dropPos, dropLevel } = dropInfo)
				} else {
					const dropInfo = getCursorDropLocation(view, e, slice)
					if (!dropInfo) return true
					$drop = dropInfo.$drop
					const dropPoint = dropInfo.dropPoint

					if (dropIsItem) {
						// eslint-disable-next-line @typescript-eslint/no-shadow
						const dropInfo = getDropLocation(view, e)
						if (!dropInfo) return true
						;({ $drop, dropPos, dropLevel } = dropInfo)
					} else {
						dropPos = dropPoint
						const $dropItem = findUp(view.state.doc, $drop, {}, $node => $node.node().type === type)
						if (!$dropItem) return true
						dropLevel = $dropItem.node().attrs.level
					}
				}
				// debugNode($drop, "$drop")
				if (!$drop || dropPos === undefined || dropLevel === undefined) return true

				const { from, to, $from, $to } = view.state.selection
				// prevent dropping inside ourselves
				if (dropPos >= from && dropPos <= to) return true

				const $selStart = $from.start() === 0
					? view.state.doc.resolve(from + 1)
					: $from
				if (!$selStart) return true


				const newSlice = conformSlice(slice, dropLevel, type)
				const tr = view.state.tr
				let offset = 0

				if (!dropIsItem) {
					const fromStart = $from.start()
					const toEnd = $to.end()
					// if the selection touches the ends of the items, leave nothing behind
					if (from === fromStart && to === toEnd) offset = 2
				}

				const selOffset = dropIsItem && offset === 0
					? 2
					: $from.start() === 0
					? -2
					: 0

				if (dropPos < from) {
					tr.delete(from - offset, to + offset)
					tr.replace(dropPos, dropPos, newSlice)
					tr.setSelection(TextSelection.create(tr.doc, dropPos + selOffset))
				} else {
					tr.replace(dropPos, dropPos, newSlice)
					tr.delete(from - offset, to + offset)
					const selMapping = tr.mapping.map(dropPos - 1) + 1
					tr.setSelection(TextSelection.create(tr.doc, selMapping + selOffset))
				}
				view.dispatch(tr)
				return true
			},
			handlePaste(view: EditorView, _e: unknown, slice: any /* todo */) {
				const { $from } = view.state.selection
				const $fromItem = findUp(view.state.doc, $from, {}, $node => $node.node().type === type)
				if (!$fromItem) return true
				const conformed = conformSlice(slice, $fromItem.node().attrs.level, type)
				slice.content = conformed.content
				return false
			},
		},

		appendTransaction(trs: readonly Transaction[], oldState: EditorState, newState: EditorState): Transaction {
			if (oldState.doc.eq(newState.doc)) return
			
			const trsWithSteps = trs.filter(tr => tr.steps.length > 0)
			if (trsWithSteps.length === 0) return
			const hasMultipleChanges = trsWithSteps.length > 1 || trsWithSteps[0].steps.length > 1
			
			const isUndoOrDrop = trs.find(tr => tr.getMeta("history$") || tr.getMeta("uiEvent") === "drop") !== undefined
			if (isUndoOrDrop) return
			// eslint-disable-next-line no-console
			if (hasMultipleChanges) return; console.log("FIXING MULTIPLE CHANGES")


			const { $from } = newState.selection
			const $fromItem = findUp(newState.doc, $from, { start: SELF }, $node => $node.node().type === type)
			const fromLevel: number = $fromItem?.node()?.attrs?.level ?? 0
			const tr = newState.tr
			let changed = false
			let lastLevel = hasMultipleChanges ? 0 : fromLevel

			findNext(newState.doc, hasMultipleChanges ? newState.doc.resolve(2)! : $fromItem!, {}, $node => {
				const node = $node.node()
				if (node.attrs.level > lastLevel + 1) {
					changed = true
					tr.setNodeMarkup($node.pos - 1, undefined, { ...node.attrs, level: lastLevel + 1 })
					return false
				} else {
					if (!hasMultipleChanges) return true
					lastLevel = node.attrs.level
				}
				return false
			})
			if (changed) return tr
		},
	})
}

class DragCursor {
	view: EditorView

	timeout?: number | NodeJS.Timeout

	container: HTMLElement

	element: HTMLElement

	handlers: ({ name: string, handler: (e: Event) => any })[]

	last?: number | ReturnType<typeof getDropLocation>

	width: number

	type: NodeType

	boundDragover: (...args: any[]) => any

	boundDragend: (...args: any[]) => any

	boundDrop: (...args: any[]) => any

	constructor(view: EditorView, container: HTMLElement, type: NodeType, width: number = 2) {
		this.container = container
		this.width = width
		this.view = view
		this.type = type
		this.boundDragover = throttle(this.dragover.bind(this), 100)
		this.boundDragend = this.dragend.bind(this)
		this.boundDrop = this.drop.bind(this)
		this.handlers = (["dragover", "dragend", "drop"] as const).map(name => {
			const handler = (e: any): any => (this as any)[`bound_${name}`](e)
			this.view.dom.addEventListener(name, handler)
			return { name, handler }
		})

		this.element = document.createElement("div")
		this.element.classList.add("drop-cursor")
		this.element.style.cssText = `
			position: absolute;
			z-index: 50;
			pointer-events: none;
			background:red;
			transition: 0.1s cubic-bezier(0.1,1,0.1,1);
			transition-property: top, left;
		`
	}

	destroy(): void {
		this.element.remove()
		this.handlers
			.forEach(({ name, handler }) => this.view.dom.removeEventListener(name, handler))
	}

	dragover(e: DragEvent): void {
		if (!this.view.editable) return
		if (!this.view.dragging?.slice) return

		let rect: any // todo
		if (!this.container.contains(this.element)) {
			this.element = this.container.appendChild(this.element)
		}
		if (this.view.dragging.slice.openStart === 0) {
			rect = this.getItemRect(e)
		} else {
			const info = getCursorDropLocation(this.view, e, this.view.dragging.slice)
			if (!info) return
			const { dropPoint: pos, $drop } = info
			if (typeof pos !== "number") return
			if (this.sameAsLast(pos)) return
			this.last = pos
			const dropIsItem = $drop.node().type === this.type
			if (dropIsItem) {
				rect = this.getItemRect(e)
			} else {
				rect = this.getCursorRect($drop, pos)
			}
		}

		if (!rect) return
		styleElement(this.container, rect, this.element)
	}

	getCursorRect($drop: ResolvedPos, pos: number): Rect | void {
		if ($drop.parent.inlineContent) {
			const coords = this.view.coordsAtPos(pos)
			return {
				top: coords.top,
				left: coords.left - (this.width / 2),
				width: this.width,
				height: coords.bottom - coords.top,
			}
		}
	}

	getItemRect(e: DragEvent): Rect | void {
		const dropInfo = getDropLocation(this.view, e)
		if (this.sameAsLast(dropInfo)) return
		this.last = dropInfo
		if (dropInfo) {
			const { insert, el, info } = dropInfo
			const rect = {
				top: info.top,
				left: info.left,
				width: info.width,
				height: this.width,
			}
			const handle = parseInt(window.getComputedStyle(el).paddingLeft.slice(0, -2), 10)
			switch (insert) {
				case "after":
					rect.top = info.bottom
					rect.left += handle
					rect.width -= handle
					break
				case "child":
					rect.top = info.bottom
					rect.left += handle * 2
					rect.width -= handle * 2
					break
			}
			return rect
		}
	}

	sameAsLast(newInfo: number | ReturnType<typeof getDropLocation>): boolean {
		return newInfo === this.last ||
		(typeof this.last === "object" && typeof newInfo === "object" &&
			newInfo.insert === this.last.insert &&
			newInfo.el === this.last.el &&
			newInfo.info.top === this.last.info.top &&
			newInfo.info.left === this.last.info.left &&
			newInfo.info.width === this.last.info.width &&
			newInfo.info.height === this.last.info.height
		)
	}

	dragend(): void {
		if (this.container.contains(this.element)) this.element.remove()
	}

	drop(): void {
		if (this.container.contains(this.element)) this.element.remove()
	}
}

