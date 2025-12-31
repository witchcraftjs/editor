import type { EditorState } from "@tiptap/pm/state"

import TextIcon from "./components/TextIcon.vue"
import HighlightIcon from "./icons/HighlightIcon.vue"
import SubscriptIcon from "./icons/SubscriptIcon.vue"
import SuperscriptIcon from "./icons/SuperscriptIcon.vue"
import type { CommandBarCommand, CommandBarMenu } from "./types.js"

import DashIconsTableColAfter from "~icons/dashicons/table-col-after"
import DashIconsTableColBefore from "~icons/dashicons/table-col-before"
import DashIconsTableColDelete from "~icons/dashicons/table-col-delete"
import DashIconsTableRowAfter from "~icons/dashicons/table-row-after"
import DashIconsTableRowBefore from "~icons/dashicons/table-row-before"
import DashIconsTableRowDelete from "~icons/dashicons/table-row-delete"

// import FaSolidBold from "~icons/fa-solid/bold"
// import FaSolidItalic from "~icons/fa-solid/italic"

export const toggleBoldCommand: CommandBarCommand = {
	type: "command" as const,
	command: "toggleMark" as const,
	args: ["bold"],
	title: "Bold",
	description: "Make the selected text bold.",
	icon: { props: { class: "font-bold", text: "B" }, component: TextIcon }
}

export const toggleItalicCommand: CommandBarCommand = {
	type: "command" as const,
	command: "toggleMark" as const,
	args: ["italic"],
	title: "Italic",
	description: "Make the selected text italic.",
	icon: { props: { class: "italic", text: "I" }, component: TextIcon }
}
export const toggleStrikeCommand: CommandBarCommand = {
	type: "command" as const,
	command: "toggleMark" as const,
	args: ["strike"],
	title: "Strike",
	description: "Strike through the selected text.",
	icon: { props: { style: "text-decoration:line-through;", text: "S" }, component: TextIcon }
}
export const toggleUnderlineCommand: CommandBarCommand = {
	type: "command" as const,
	command: "toggleMark" as const,
	args: ["underline"],
	title: "Underline",
	description: "Underline the selected text.",
	icon: { props: { class: "underline", text: "U" }, component: TextIcon }
}
export const toggleCodeCommand: CommandBarCommand = {
	type: "command" as const,
	command: "toggleMark" as const,
	args: ["code"],
	title: "Code",
	description: "Make the selected text code.",
	icon: { props: { class: "font-bold", text: "</>" }, component: TextIcon }
}

export const toggleSubscriptCommand: CommandBarCommand = {
	type: "command" as const,
	command: "toggleMark" as const,
	args: ["subscript"],
	title: "Subscript",
	description: "Subscript the selected text.",
	icon: { component: SubscriptIcon }
}

export const toggleSuperscriptCommand: CommandBarCommand = {
	type: "command" as const,
	command: "toggleMark" as const,
	args: ["superscript"],
	title: "Superscript",
	description: "Superscript the selected text.",
	icon: { component: SuperscriptIcon }
}

export const tableCanShow = (state: EditorState): boolean => {
	const fromNode = -1 < state.selection.$from.depth ? state.selection.$from.node(-1) : undefined
	const toNode = -1 < state.selection.$to.depth ? state.selection.$to.node(-1) : undefined
	return fromNode?.type.name === "tableCell" && toNode?.type.name === "tableCell"
}

export const tableAddColBeforeCommand: CommandBarCommand = {
	type: "command" as const,
	command: "addColumnBefore" as const,
	title: "Add column before.",
	description: "Add a column before the selected column.",
	icon: { component: DashIconsTableColBefore },
	canShow: tableCanShow
}

export const tableAddColAfterCommand: CommandBarCommand = {
	type: "command" as const,
	command: "addColumnAfter" as const,
	title: "Add column after.",
	description: "Add a column after the selected column.",
	icon: { component: DashIconsTableColAfter },
	canShow: tableCanShow
}

export const tableAddRowBeforeCommand: CommandBarCommand = {
	type: "command" as const,
	command: "addRowBefore" as const,
	title: "Add row before.",
	description: "Add a row before the selected row.",
	icon: { component: DashIconsTableRowBefore },
	canShow: tableCanShow
}

export const tableAddRowAfterCommand: CommandBarCommand = {
	type: "command" as const,
	command: "addRowAfter" as const,
	title: "Add row after.",
	description: "Add a row after the selected row.",
	icon: { component: DashIconsTableRowAfter },
	canShow: tableCanShow
}
export const tableDeleteRowCommand: CommandBarCommand = {
	type: "command" as const,
	command: "deleteRow" as const,
	title: "Delete row.",
	description: "Delete the selected row.",
	icon: { component: DashIconsTableRowDelete },
	canShow: tableCanShow
}

export const tableDeleteColCommand: CommandBarCommand = {
	type: "command" as const,
	command: "deleteColumn" as const,
	title: "Delete column.",
	description: "Delete the selected column.",
	icon: { component: DashIconsTableColDelete },
	canShow: tableCanShow
}

export function createToggleHighlightCommand(slotCount: number, prefix = "slot"): CommandBarCommand[] {
	return [...Array(slotCount).keys()].map(i => {
		const command: CommandBarCommand = {
			type: "command" as const,
			command: "toggleHighlight" as const,
			title: `Highlight Slot ${i + 1}`,
			description: `Highlight the selected text with color slot ${i + 1}.`,
			icon: { component: HighlightIcon, props: { colorSlot: prefix + (i + 1) } },
			args: [prefix + (i + 1)]
		}
		return command
	})
}
export const toggleHighlightsCommands = createToggleHighlightCommand(5)

export const unsetHighlightCommand: CommandBarCommand = {
	type: "command" as const,
	command: "unsetHighlight" as const,
	title: "Unset Highlight",
	description: "Unset the highlight mark.",
	icon: { component: HighlightIcon, props: { colorSlot: undefined } },
	args: []
}

export const defaultCommandBarMenuItems: CommandBarMenu = {
	enabled: true,
	options: {
		onlyOpenOnSelection: true
	},
	commands: [
		{
			type: "group" as const,
			groupType: "inline" as const,
			title: "Basic",
			variations: [
				toggleBoldCommand,
				toggleItalicCommand,
				toggleStrikeCommand,
				toggleUnderlineCommand,
				toggleCodeCommand
			]
		},
		{
			type: "group" as const,
			groupType: "inline" as const,
			title: "Highlight",
			variations: [
				...toggleHighlightsCommands,
				unsetHighlightCommand
			]
		},
		{
			type: "group" as const,
			groupType: "inline" as const,
			title: "Sub/Sup",
			variations: [
				toggleSubscriptCommand,
				toggleSuperscriptCommand
			]
		},
		{
			type: "group" as const,
			groupType: "inline" as const,
			title: "Table",
			variations: [
				tableAddColBeforeCommand,
				tableAddColAfterCommand,
				tableAddRowBeforeCommand,
				tableAddRowAfterCommand,
				tableDeleteRowCommand,
				tableDeleteColCommand
			]
		}
	]
}
