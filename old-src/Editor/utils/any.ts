import type { Command } from "@/components/Editor/types"


export function any(...commands: Command[]): Command {
	return function(state, dispatch, view): boolean {
		for (let command of commands) {
			if (command(state, dispatch, view)) {return true}
		}
		return true
	}
}
