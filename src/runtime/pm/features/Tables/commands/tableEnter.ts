import { type Command, getNodeType } from "@tiptap/core"
import type { NodeType } from "@tiptap/pm/model"

declare module "@tiptap/core" {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		tableEnter: {
			/**
			 * Handles enter in a table. Splits the table at the next row, inserting a default item, or if it can't, after the table. Does not delete the selection as it's just weird since delete in a table just clears them.
			 *
			 * @redirectable
			 */
			tableEnter: (pos?: number) => ReturnType
		}
	}
}

export const tableEnter = (
	tableTypesOrNames: (string | NodeType)[] = ["table", "tableRow", "tableCell", "tableHeader"],
	itemTypeOrName: string | NodeType = "item"
) => (pos?: number): Command => ({ state, dispatch, tr }) => {
	const itemType = getNodeType(itemTypeOrName, state.schema)
	const tableType = tableTypesOrNames.map(name => getNodeType(name, state.schema))
	const { $from, empty } = state.selection
	const $pos = pos !== undefined ? tr.doc.resolve(pos) : $from
	const parent = $pos.node(-1)
	if (tableType.includes(parent.type)) {
		const item = itemType.createAndFill()
		if (!item) return false
		if (dispatch) {
			if (pos === undefined && !empty) {
				// its just weird
				// tr.delete($from.pos, $to.pos);
			}
			tr.insert($from.after(-2), item)
		}
		return true
	}
	return false
}
