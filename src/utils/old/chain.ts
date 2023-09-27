import type { Command } from "prosemirror-state"


export const chain = (...commands: Command[]): Command => (state, dispatch, view) => {
	for (const command of commands) {
		if (!command(state, dispatch, view)) {return false}
	}
	return true
}
