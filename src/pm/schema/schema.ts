/* eslint-disable @typescript-eslint/naming-convention */
import { Extension, getSchema } from "@tiptap/core"
import { History } from "@tiptap/extension-history"

import { Bold } from "./Bold.js"
import { CodeBlock } from "./CodeBlock.js"
import { Document } from "./Document.js"
import { HardBreak } from "./HardBreak.js"
import { Heading } from "./Heading.js"
import { Image } from "./Image.js"
import { Italic } from "./Italic.js"
import { Item } from "./Item.js"
import { List } from "./List.js"
import { Paragraph } from "./Paragraph.js"
import { Text } from "./Text.js"

import { rawCommands } from "../commands/index.js"
import { debugSelection } from "../plugins/debugSelection.js"


const extensions = [
	Document,
	List,
	Item,
	Paragraph,
	Text,
	HardBreak,
	CodeBlock,
	Heading,
	Image,
	Italic,
	Bold,
	History,
	Extension.create({
		addProseMirrorPlugins() {
			return [
				debugSelection(),
			]
		},
		addCommands() {
			return {
				backspace: rawCommands.backspace.create(),
				changeAttrs: rawCommands.changeAttrs.create(),
				copyOrMoveListItem: rawCommands.copyOrMoveListItem.create(),
				toggleBold: rawCommands.toggleBold.create(),
			}
		},

		addKeyboardShortcuts() {
			return {
				Backspace: () => {
					this.editor.commands.backspace()
					return true
				},
				[`Ctrl-Backspace`]: () => {
					this.editor.commands.deleteNodes()
					return true
				},
				[`Ctrl-z`]: () => this.editor.commands.undo(),
				Enter: ({ editor }) => {
					editor.commands.enter()
					return true
				},

			}
		},
	}),
]
export const RootExtension = Extension.create<{}>({
	name: "root",
	addExtensions() {
		return extensions
	},
})
const _schema = getSchema(extensions)
export const schema = _schema

