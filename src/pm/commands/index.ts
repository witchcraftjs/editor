import { type Command } from "@tiptap/core"
import { deleteSelection } from "prosemirror-commands"

import { backspace } from "./backspace.js"
import { changeAttrs } from "./changeAttrs.js"
import { changeLevelAttr } from "./changeLevelAttr.js"
import { changeListItemType } from "./changeListItemType.js"
import { changeTypeAttr } from "./changeTypeAttr.js"
import { copyOrMoveListItem } from "./copyOrMoveListItem.js"
import { deleteNodes } from "./deleteNodes.js"
import { enter } from "./enter.js"
import { indentListItem } from "./indentListItem.js"
import { unindentListItem } from "./unindentListItem.js"


export const rawCommands = {
	changeLevelAttr: { create: changeLevelAttr },
	changeAttrs: { create: changeAttrs },
	changeTypeAttr: { create: changeTypeAttr },
	changeListItemType: { create: changeListItemType },
	copyOrMoveListItem: { create: copyOrMoveListItem },
	enter: { create: enter },
	deleteSelection: { create: deleteSelection },
	deleteNodes: { create: deleteNodes	},
	indentListItem: { create: indentListItem },
	unindentListItem: { create: unindentListItem },
	backspace: { create: backspace },
	historyUndo: {
		buttons: [[]],
		create: () => (): Command => ({ commands }) => commands.undo(),
	},
	historyRedo: {
		buttons: [[]],
		create: () => (): Command => ({ commands }) => commands.redo(),
	},
	toggleBold: {
		buttons: [[]],
		create: () => (): Command => ({ commands }) => commands.toggleMark("bold"),
	},
	toggleItalic: {
		buttons: [[]],
		create: () => (): Command => ({ commands }) => commands.toggleMark("italic"),
	},
	toggleInlineCode: {
		buttons: [[]],
		create: () => (): Command => ({ commands }) => commands.toggleMark("inline-code"),
	},
	toggleCodeBlock: {
		buttons: [[]],
		create: () => (): Command => ({ commands }) => commands.toggleNode("code", "paragraph"),
	},
}
