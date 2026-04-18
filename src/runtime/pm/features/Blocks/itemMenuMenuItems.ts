import type { ItemMenuCommand, ItemMenuGroup } from "./types.js"

// lucides lists are weird
import IconBulletList from "~icons/heroicons/list-bullet-16-solid"
import IconNumberedList from "~icons/heroicons/numbered-list-16-solid"
import IconCode from "~icons/lucide/code"
import IconEmbeddedDocument from "~icons/lucide/file-text"
import IconHeading1 from "~icons/lucide/heading-1"
import IconHeading2 from "~icons/lucide/heading-2"
import IconHeading3 from "~icons/lucide/heading-3"
import IconHeading4 from "~icons/lucide/heading-4"
import IconHeading5 from "~icons/lucide/heading-5"
import IconHeading6 from "~icons/lucide/heading-6"
import IconParagraph from "~icons/lucide/pilcrow"
import IconTable from "~icons/lucide/sheet"
import IconTrash from "~icons/lucide/trash"

export const deleteNodesCommand: ItemMenuCommand = {
	type: "command" as const,
	command: "deleteItem",
	title: "Delete",
	args: ["$blockPos"],
	icon: { props: { class: "w-[0.7em]" }, component: IconTrash }
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
	icon: IconBulletList,
	args: [{ type: "unordered" }, "$blockPos"]
}
export const numberedItemCommand: ItemMenuCommand = {
	type: "command" as const,
	command: "changeItemType",
	icon: IconNumberedList,
	title: "Numbered Item",
	args: [{ type: "ordered" }, "$blockPos"]
}

export const codeBlockCommand: ItemMenuCommand = {
	type: "command" as const,
	command: "setNode",
	title: "Code",
	icon: IconCode,
	args: ["codeBlock", { language: "", loading: false }, "$blockPos"]
}
export const embeddedDocCommand: ItemMenuCommand = {
	type: "command" as const,
	command: "setNode",
	title: "Embed",
	icon: IconEmbeddedDocument,
	args: ["embeddedDoc", { embedId: { docId: undefined, embedId: undefined } }, "$blockPos"]
}
export const paragraphCommand: ItemMenuCommand = {
	type: "command" as const,
	command: "setNode",
	title: "Paragraph",
	icon: IconParagraph,
	args: ["paragraph", { }, "$blockPos"]
}
export const tableCommand: ItemMenuCommand = {
	type: "command" as const,
	command: "setNode",
	title: "Table",
	icon: IconTable,
	args: ["table", { }, "$blockPos"]
}

export const heading1Command: ItemMenuCommand = {
	type: "command" as const,
	command: "setHeading",
	title: "Heading Level 1",
	icon: IconHeading1,
	args: [{ level: 1, onlyHeadings: false }, "$contentPos"]
}
export const heading2Command: ItemMenuCommand = {
	type: "command" as const,
	command: "setHeading",
	title: "Heading Level 2",
	icon: IconHeading2,
	args: [{ level: 2, onlyHeadings: false }, "$contentPos"]
}
export const heading3Command: ItemMenuCommand = {
	type: "command" as const,
	command: "setHeading",
	title: "Heading Level 3",
	icon: IconHeading3,
	args: [{ level: 3, onlyHeadings: false }, "$contentPos"]
}
export const heading4Command: ItemMenuCommand = {
	type: "command" as const,
	command: "setHeading",
	title: "Heading Level 4",
	icon: IconHeading4,
	args: [{ level: 4, onlyHeadings: false }, "$contentPos"]
}
export const heading5Command: ItemMenuCommand = {
	type: "command" as const,
	command: "setHeading",
	title: "Heading Level 5",
	icon: IconHeading5,
	args: [{ level: 5, onlyHeadings: false }, "$contentPos"]
}
export const heading6Command: ItemMenuCommand = {
	type: "command" as const,
	command: "setHeading",
	title: "Heading Level 6",
	icon: IconHeading6,
	args: [{ level: 6, onlyHeadings: false }, "$contentPos"]
}
export const defaultItemMenu = [

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
	} satisfies ItemMenuGroup,
	deleteNodesCommand
]
