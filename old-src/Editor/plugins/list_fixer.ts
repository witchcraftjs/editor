/* eslint-disable @typescript-eslint/naming-convention */
import { throttle } from "lodash"
import type { NodeType, ResolvedPos } from "prosemirror-model"
import { Plugin, PluginKey, TextSelection } from "prosemirror-state"
import type { EditorView } from "prosemirror-view"

import { style_element } from "./style_element"

import { Rect, SELF } from "@/components/Editor/types"
import { conform_slice, find_next, find_up, get_cursor_drop_location, get_drop_location } from "@/components/Editor/utils"


export function list_fixer(
	{
		type,
		container,
	}: {
		type: NodeType
		container: HTMLElement
	}): Plugin {
	let key = new PluginKey("list-fixer")
	return new Plugin({
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		view(view) { return new DragCursor(view, container, type, 2) },
		key,
		props: {
			// @ts-expect-error
			handleDrop(view: EditorView, e: MouseEvent, slice) {
				let $drop
				let drop_level!: number
				let drop_pos!: number
				let drop_is_item = true
				if (slice.openStart === 0) {
					let drop_info = get_drop_location(view, e)

					if (!drop_info) return true
					;({ $drop, drop_pos, drop_level } = drop_info)
				} else {
					let drop_info = get_cursor_drop_location(view, e, slice)
					if (!drop_info) return true
					$drop = drop_info.$drop
					let drop_point = drop_info.drop_point

					if (drop_is_item) {
						// eslint-disable-next-line no-shadow
						let drop_info = get_drop_location(view, e)
						if (!drop_info) return true
						;({ $drop, drop_pos, drop_level } = drop_info)
					} else {
						drop_pos = drop_point
						let $drop_item = find_up(view.state.doc, $drop, {}, $node => $node.node().type === type)
						if (!$drop_item) return true
						drop_level = $drop_item.node().attrs.level
					}
				}
				// debug_node($drop, "$drop")
				if (!$drop || drop_pos === undefined || drop_level === undefined) return true

				let { from, to, $from, $to } = view.state.selection
				// prevent dropping inside ourselves
				if (drop_pos >= from && drop_pos <= to) return true

				let $sel_start = $from.start() === 0
					? view.state.doc.resolve(from + 1)
					: $from
				if (!$sel_start) return true


				let new_slice = conform_slice(slice, drop_level, type)
				let tr = view.state.tr
				let offset = 0

				if (!drop_is_item) {
					let from_start = $from.start()
					let to_end = $to.end()
					// if the selection touches the ends of the items, leave nothing behind
					if (from === from_start && to === to_end) offset = 2
				}

				let sel_offset = drop_is_item && offset === 0
					? 2
					: $from.start() === 0
					? -2
					: 0

				if (drop_pos < from) {
					tr.delete(from - offset, to + offset)
					tr.replace(drop_pos, drop_pos, new_slice)
					tr.setSelection(TextSelection.create(tr.doc, drop_pos + sel_offset))
				} else {
					tr.replace(drop_pos, drop_pos, new_slice)
					tr.delete(from - offset, to + offset)
					let sel_mapping = tr.mapping.map(drop_pos - 1) + 1
					tr.setSelection(TextSelection.create(tr.doc, sel_mapping + sel_offset))
				}
				view.dispatch(tr)
				return true
			},
			handlePaste(view, _e, slice) {
				let { $from } = view.state.selection
				let $from_item = find_up(view.state.doc, $from, {}, $node => $node.node().type === type)
				if (!$from_item) return true
				let conformed = conform_slice(slice, $from_item.node().attrs.level, type)
				slice.content = conformed.content
				return false
			},
		},
		appendTransaction(trs, olds, news) {
			if (olds.doc.eq(news.doc)) return
			// eslint-disable-next-line no-shadow
			let trs_with_steps = trs.filter(tr => tr.steps.length > 0)
			if (trs_with_steps.length === 0) return
			let has_multiple_changes = trs_with_steps.length > 1 || trs_with_steps[0].steps.length > 1
			// eslint-disable-next-line no-shadow
			let is_undo_or_drop = trs.find(tr => tr.getMeta("history$") || tr.getMeta("uiEvent") === "drop") !== undefined
			if (is_undo_or_drop) return
			// eslint-disable-next-line no-console
			if (has_multiple_changes) return; console.log("FIXING MULTIPLE CHANGES")


			let { $from } = news.selection
			let $from_item = find_up(news.doc, $from, { start: SELF }, $node => $node.node().type === type)
			let from_level: number = $from_item?.node()?.attrs?.level ?? 0
			let tr = news.tr
			let changed = false
			let last_level = has_multiple_changes ? 0 : from_level

			find_next(news.doc, has_multiple_changes ? news.doc.resolve(2)! : $from_item!, {}, $node => {
				let node = $node.node()
				if (node.attrs.level > last_level + 1) {
					changed = true
					tr.setNodeMarkup($node.pos - 1, undefined, { ...node.attrs, level: last_level + 1 })
					return false
				} else {
					if (!has_multiple_changes) return true
					last_level = node.attrs.level
				}
				return false
			})
			if (changed) return tr
			return
		},
	})
}

class DragCursor {
	view: EditorView
	timeout?: number | NodeJS.Timeout
	container: HTMLElement
	element: HTMLElement
	handlers: ({name: string, handler: (e: Event) => any})[]
	last?: number | ReturnType<typeof get_drop_location>
	width: number
	type: NodeType
	bound_dragover: (...args: any[]) => any
	bound_dragend: (...args: any[]) => any
	bound_drop: (...args: any[]) => any
	constructor(view: EditorView, container: HTMLElement, type: NodeType, width = 2) {
		this.container = container
		this.width = width
		this.view = view
		this.type = type
		this.bound_dragover = throttle(this.dragover.bind(this), 100)
		this.bound_dragend = this.dragend.bind(this)
		this.bound_drop = this.drop.bind(this)
		this.handlers = (["dragover", "dragend", "drop"] as const).map(name => {
			let handler = (e: any): any => (this as any)[`bound_${name}`](e)
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

		let rect
		if (!this.container.contains(this.element)) {
			this.element = this.container.appendChild(this.element)
		}
		if (this.view.dragging.slice.openStart === 0) {
			rect = this.get_item_rect(e)
		} else {
			let info = get_cursor_drop_location(this.view, e, this.view.dragging.slice)
			if (!info) return
			let { drop_point: pos, $drop } = info
			if (typeof pos !== "number") return
			if (this.same_as_last(pos)) return
			this.last = pos
			let drop_is_item = $drop.node().type === this.type
			if (drop_is_item) {
				rect = this.get_item_rect(e)
			} else {
				rect = this.get_cursor_rect($drop, pos)
			}
		}

		if (!rect) return
		style_element(this.container, rect, this.element)
	}
	get_cursor_rect($drop: ResolvedPos, pos: number): Rect | void {
		if ($drop.parent.inlineContent) {
			let coords = this.view.coordsAtPos(pos)
			return {
				top: coords.top,
				left: coords.left - (this.width / 2),
				width: this.width,
				height: coords.bottom - coords.top,
			}
		}
	}
	get_item_rect(e: DragEvent): Rect | void {
		let drop_info = get_drop_location(this.view, e)
		if (this.same_as_last(drop_info)) return
		this.last = drop_info
		if (drop_info) {
			let { insert, el, info } = drop_info
			let rect = {
				top: info.top,
				left: info.left,
				width: info.width,
				height: this.width,
			}
			let handle = parseInt(window.getComputedStyle(el).paddingLeft.slice(0, -2), 10)
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
	same_as_last(new_info: number | ReturnType<typeof get_drop_location>): boolean {
		return new_info === this.last ||
		(typeof this.last === "object" && typeof new_info === "object" &&
			new_info.insert === this.last.insert &&
			new_info.el === this.last.el &&
			new_info.info.top === this.last.info.top &&
			new_info.info.left === this.last.info.left &&
			new_info.info.width === this.last.info.width &&
			new_info.info.height === this.last.info.height
		)
	}
	dragend(): void {
		if (this.container.contains(this.element)) this.element.remove()
	}
	drop(): void {
		if (this.container.contains(this.element)) this.element.remove()
	}
}

