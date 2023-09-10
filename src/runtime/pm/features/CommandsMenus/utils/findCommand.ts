import type { AddParameters } from "@alanscodelog/utils"
import { castType } from "@alanscodelog/utils/castType"

import type { Command, CommandGroup } from "../types.js"

/**
 * Deep search through a list of commands/command groups.
 *
 * The callback is passed each command
 * and it's parent group if it has one..
 *
 * Returning true will stop the search.
 */
export function findCommand<
	TEntry extends Command | CommandGroup,
	TCommand extends Exclude<TEntry, CommandGroup>,
	TCommandGroup extends Exclude<TEntry, Command>
>(
	commands: TEntry[],
	cb: (command: TCommand, parent: TCommandGroup | undefined) => boolean
): boolean {
	// eslint-disable-next-line prefer-rest-params
	const parent = arguments[2]
	const internalFindCommand = findCommand as AddParameters<typeof findCommand, [CommandGroup | undefined]>

	for (const item of commands) {
		if (item.type === "command") {
			castType<TCommand>(item)
			const res = cb(item, parent)
			if (res) return true
		} else if (item.type === "group") {
			const res = internalFindCommand(item.variations, cb as any, item)
			if (res) return true
		}
	}
	return false
}
