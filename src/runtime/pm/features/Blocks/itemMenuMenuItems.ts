import type { ItemMenuCommand, ItemMenuGroup } from "./types.js"

import FaTable from "~icons/fa/table"
import FaTrash from "~icons/fa-solid/trash"
import FaSolidPar from "~icons/fa6-solid/paragraph"
import FluentDocumentSyncFilled from "~icons/fluent/document-sync-16-filled"
import HeroIconsCode from "~icons/heroicons/code-bracket-16-solid"
import HeroIconsBulletList from "~icons/heroicons/list-bullet-16-solid"
import HeroIconsNumberedList from "~icons/heroicons/numbered-list-16-solid"
import LucideHeading1 from "~icons/lucide/heading-1"
import LucideHeading2 from "~icons/lucide/heading-2"
import LucideHeading3 from "~icons/lucide/heading-3"
import LucideHeading4 from "~icons/lucide/heading-4"
import LucideHeading5 from "~icons/lucide/heading-5"
import LucideHeading6 from "~icons/lucide/heading-6"

export const deleteNodesCommand: ItemMenuCommand = {
	type: "command" as const,
	command: "deleteItem",
	title: "Delete",
	args: ["$blockPos"],
	icon: { props: { class: "w-[0.7em]" }, component: FaTrash }
}
export const regularItemCommand: ItemMenuCommand = {
	type: "command" as const,
	command: "changeItemType",
	title: "Regular Item",
	args: [{ type: "" }, "$blockPos"]
}
export const bulletItemCommand: ItemMenuCommand = {
	type: "command" as const,
	command: "changeItemType",
	title: "Bullet Item",
	icon: HeroIconsBulletList,
	args: [{ type: "unordered" }, "$blockPos"]
}
export const numberedItemCommand: ItemMenuCommand = {
	type: "command" as const,
	command: "changeItemType",
	icon: HeroIconsNumberedList,
	title: "Numbered Item",
	args: [{ type: "ordered" }, "$blockPos"]
}

export const codeBlockCommand: ItemMenuCommand = {
	type: "command" as const,
	command: "setNode",
	title: "Code",
	icon: HeroIconsCode,
	args: ["codeBlock", { language: "", loading: false }, "$blockPos"]
}
export const embeddedDocCommand: ItemMenuCommand = {
	type: "command" as const,
	command: "setNode",
	title: "Embed",
	icon: FluentDocumentSyncFilled,
	args: ["embeddedDoc", { embedId: { docId: undefined, embedId: undefined } }, "$blockPos"]
}
export const paragraphCommand: ItemMenuCommand = {
	type: "command" as const,
	command: "setNode",
	title: "Paragraph",
	icon: FaSolidPar,
	args: ["paragraph", { }, "$blockPos"]
}
export const tableCommand: ItemMenuCommand = {
	type: "command" as const,
	command: "setNode",
	title: "Table",
	icon: FaTable,
	args: ["table", { }, "$blockPos"]
}

export const heading1Command: ItemMenuCommand = {
	type: "command" as const,
	command: "setHeading",
	title: "Heading Level 1",
	icon: LucideHeading1,
	args: [{ level: 1, onlyHeadings: false }, "$contentPos"]
}
export const heading2Command: ItemMenuCommand = {
	type: "command" as const,
	command: "setHeading",
	title: "Heading Level 2",
	icon: LucideHeading2,
	args: [{ level: 2, onlyHeadings: false }, "$contentPos"]
}
export const heading3Command: ItemMenuCommand = {
	type: "command" as const,
	command: "setHeading",
	title: "Heading Level 3",
	icon: LucideHeading3,
	args: [{ level: 3, onlyHeadings: false }, "$contentPos"]
}
export const heading4Command: ItemMenuCommand = {
	type: "command" as const,
	command: "setHeading",
	title: "Heading Level 4",
	icon: LucideHeading4,
	args: [{ level: 4, onlyHeadings: false }, "$contentPos"]
}
export const heading5Command: ItemMenuCommand = {
	type: "command" as const,
	command: "setHeading",
	title: "Heading Level 5",
	icon: LucideHeading5,
	args: [{ level: 5, onlyHeadings: false }, "$contentPos"]
}
export const heading6Command: ItemMenuCommand = {
	type: "command" as const,
	command: "setHeading",
	title: "Heading Level 6",
	icon: LucideHeading6,
	args: [{ level: 6, onlyHeadings: false }, "$contentPos"]
}
export const defaultItemMenu = [
	deleteNodesCommand,
	{
		type: "group" as const,
		title: "Change Item Type",
		variations: [
			regularItemCommand,
			bulletItemCommand,
			numberedItemCommand
		]
	} satisfies ItemMenuGroup,
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
	} satisfies ItemMenuGroup
]
