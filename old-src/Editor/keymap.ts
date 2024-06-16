import { chainCommands, createParagraphNear, deleteSelection, exitCode, joinBackward, liftEmptyBlock, newlineInCode, splitBlock, toggleMark } from "prosemirror-commands"
import { redo, undo } from "prosemirror-history"
import type { EditorState } from "prosemirror-state"
import type { EditorView } from "prosemirror-view"

import { backspace, enter, lift_list, move_list_down, move_list_up, sink_list } from "./commands"
import { debug_sel } from "./dev_utils"
import { schema } from "./schema"
import type { Dispatch } from "./types"
import { any } from "./utils"


const enter_command = enter({
	splittable: [
		schema.nodes.paragraph,
		schema.nodes.heading,
	],
	fallback: schema.nodes.paragraph,
	parent: schema.nodes.item,
	override: { heading: schema.nodes.paragraph },
})
const enter_inside_command = (state: EditorState, dispatch: Dispatch): boolean => {
	// let tr = state.tr
	// tr.replaceSelectionWith(schema.nodes.hard_break.create(), true)
	// dispatch(tr)
	dispatch(state.tr.replaceSelectionWith(schema.nodes.hard_break.create()).scrollIntoView())
	// return true
}
let hold_time = 500
let enter_held: number | undefined
let enter_timeout: number | undefined
let already_executed_enter = false

export const create_keyup_handler = (exec: any) => (e: KeyboardEvent): void => {
	if (e.key === "Enter") {
		if (already_executed_enter) {
			already_executed_enter = false
			enter_held = undefined
			enter_timeout = undefined
		} else {
			if (enter_timeout !== undefined) clearTimeout(enter_timeout)
			enter_timeout = undefined
			exec(enter_inside_command)
		}
		e.preventDefault()
	}
}

export const create_keydown_handler = (exec: any) => (view: EditorView, e: KeyboardEvent): boolean => {
	if (e.key === "Enter" && enter_held === undefined) {
		if (enter_timeout === undefined) {
			enter_timeout = setTimeout(() => {
				exec(enter_command)
				already_executed_enter = true
			}, hold_time) as any as number
		}
		e.preventDefault()
		return true
	} else {
		if (enter_timeout !== undefined) clearTimeout(enter_timeout)
		enter_timeout = undefined
		already_executed_enter = false
		enter_held = undefined
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
			exec(lift_list(schema.nodes.item))
		} else {
			exec(sink_list(schema.nodes.item))
		}
		e.preventDefault()
		return true
	}
	if (e.ctrlKey && e.key === "/") {
		debug_sel(view.state.selection)
		return true
	}
	if (e.ctrlKey && e.key === "ArrowUp") {
		exec(move_list_up(schema.nodes.item))
		e.preventDefault()
		return true
	}
	if (e.ctrlKey && e.key === "ArrowDown") {
		exec(move_list_down(schema.nodes.item))
		e.preventDefault()
		return true
	}
	return false
}
