import {
	Table as TiptapTable,
	TableCell as TiptapTableCell,
	TableHeader as TiptapTableHeader,
	TableRow as TiptapTableRow
} from "@tiptap/extension-table"

import { tableEnter } from "./commands/tableEnter.js"

// eslint-disable-next-line @typescript-eslint/naming-convention
export const TableRow = TiptapTableRow.extend({
	// force table rows to contain something, otherwise create and fill won't work as expected
	content: "(tableCell | tableHeader)+",
	addKeyboardShortcuts() {
		return {}
	}
})

// eslint-disable-next-line @typescript-eslint/naming-convention
export const TableCell = TiptapTableCell.extend({
	content: "block",
	addKeyboardShortcuts() {
		return {}
	}
})

// eslint-disable-next-line @typescript-eslint/naming-convention
export const TableHeader = TiptapTableHeader.extend({
	content: "block",
	addKeyboardShortcuts() {
		return {}
	}
})

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Table = TiptapTable.extend({
	addOptions() {
		return {
			...(this as any).parent?.(),
			resizable: true,
			lastColumnResizable: false
		}
	},
	addCommands() {
		return {
			tableEnter: tableEnter()
		}
	},
	addKeyboardShortcuts() {
		return {}
	}
})

// eslint-disable-next-line @typescript-eslint/naming-convention
export const TableExtensions = [Table, TableRow, TableCell, TableHeader]

export type NodeTableName = "table"
export type NodeTableRowName = "tableRow"
export type NodeTableCellName = "tableCell"
export type NodeTableHeaderName = "tableHeader"
