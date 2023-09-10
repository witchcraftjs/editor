import { toggleMark } from "prosemirror-commands"
import { redo, undo } from "prosemirror-history"
import type { Command } from "prosemirror-state"
import type { EditorProps } from "prosemirror-view"

import { enter, liftList, moveListDown, moveListUp, sinkList } from "./commands/index.js"
import { schema } from "./schema.js"
import { debugSel } from "./utils/internal/debugSel.js"


const enterCommand = enter({
	splittable: [
		schema.nodes.paragraph,
		schema.nodes.heading,
	],
	fallback: schema.nodes.paragraph,
	parent: schema.nodes.item,
	override: { heading: schema.nodes.paragraph },
})
const enterInsideCommand: Command = (state, dispatch) => {
	// let tr = state.tr
	// tr.replaceSelectionWith(schema.nodes.hard_break.create(), true)
	// dispatch(tr)
	dispatch?.(state.tr.replaceSelectionWith(schema.nodes.hard_break.create()).scrollIntoView())
	return true
}
const holdTime = 500
let enterHeld: number | undefined
let enterTimeout: number | undefined
let alreadyExecutedEnter = false

export const createKeyupHandler = (exec: any) => (e: KeyboardEvent): void => {
	if (e.key === "Enter") {
		if (alreadyExecutedEnter) {
			alreadyExecutedEnter = false
			enterHeld = undefined
			enterTimeout = undefined
		} else {
			if (enterTimeout !== undefined) clearTimeout(enterTimeout)
			enterTimeout = undefined
			exec(enterInsideCommand)
		}
		e.preventDefault()
	}
}

export const createKeydownHandler = (exec: any): EditorProps["handleKeyDown"] => (view, e) => {
	if (e.key === "Enter" && enterHeld === undefined) {
		if (enterTimeout === undefined) {
			enterTimeout = setTimeout(() => {
				exec(enterCommand)
				alreadyExecutedEnter = true
			}, holdTime) as any as number
		}
		e.preventDefault()
		return true
	} else {
		if (enterTimeout !== undefined) clearTimeout(enterTimeout)
		enterTimeout = undefined
		alreadyExecutedEnter = false
		enterHeld = undefined
	}
	if (e.ctrlKey && e.key === "b") {
		exec(toggleMark(schema.marks.strong))
		return true
	}
	if (e.ctrlKey && e.key === "z") {
		e.preventDefault()
		exec(undo)
		return true
	}
	if (e.ctrlKey && e.key === "y") {
		e.preventDefault()
		exec(redo)
		return true
	}
	if (e.key === "Tab") {
		if (e.shiftKey) {
			exec(liftList(schema.nodes.item))
		} else {
			exec(sinkList(schema.nodes.item))
		}
		e.preventDefault()
		return true
	}
	if (e.ctrlKey && e.key === "/") {
		debugSel(view.state.selection)
		return true
	}
	if (e.ctrlKey && e.key === "ArrowUp") {
		exec(moveListUp(schema.nodes.item))
		e.preventDefault()
		return true
	}
	if (e.ctrlKey && e.key === "ArrowDown") {
		exec(moveListDown(schema.nodes.item))
		e.preventDefault()
		return true
	}
	return false
}
