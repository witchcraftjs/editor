import type { CommandGroup } from "../../CommandsMenus/types.js"
import {
	bulletItemCommand,
	codeBlockCommand,
	deleteNodesCommand,
	embeddedDocCommand,
	heading1Command,
	heading2Command,
	heading3Command,
	heading4Command,
	heading5Command,
	heading6Command,
	numberedItemCommand,
	paragraphCommand,
	tableCommand
} from "../itemMenuMenuItems.js"

export const defaultItemMenu = [
	deleteNodesCommand,
	{
		type: "group" as const,
		title: "Change Item Type",
		variations: [
			bulletItemCommand,
			numberedItemCommand
		]
	} satisfies CommandGroup,
	{
		type: "group" as const,
		title: "Change Block Type",
		variations: [
			codeBlockCommand,
			embeddedDocCommand,
			paragraphCommand,
			tableCommand,
			heading1Command,
			heading2Command,
			heading3Command,
			heading4Command,
			heading5Command,
			heading6Command

		]
	} satisfies CommandGroup
]
