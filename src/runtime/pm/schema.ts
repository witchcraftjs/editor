import { type EditorOptions, type Extension, getSchema, type Mark, type Node } from "@tiptap/core"
import { Bold } from "@tiptap/extension-bold"
import { Code } from "@tiptap/extension-code"
import { Dropcursor } from "@tiptap/extension-dropcursor"
import { Gapcursor } from "@tiptap/extension-gapcursor"
import { Italic } from "@tiptap/extension-italic"
import { Paragraph } from "@tiptap/extension-paragraph"
import { Strike } from "@tiptap/extension-strike"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Text } from "@tiptap/extension-text"
import { Underline } from "@tiptap/extension-underline"
import type { Schema } from "@tiptap/pm/model"

import { Base } from "./features/Base/Base.js"
import { Blockquote, Cite, type NodeBlockquoteName, type NodeCiteName } from "./features/Blockquote/Blockquote.js"
import { Item, type NodeItemName } from "./features/Blocks/Item.js"
import { List, type NodeListName } from "./features/Blocks/List.js"
import { CodeBlock, type NodeCodeBlockName } from "./features/CodeBlock/CodeBlock.js"
import { CommandBar } from "./features/CommandsMenus/CommandBar.js"
import { Document, type NodeDocumentName } from "./features/Document/Document.js"
import { EmbeddedDocument, type NodeEmbeddedDocumentName } from "./features/EmbeddedDocument/EmbeddedDocument.js"
import { HardBreak } from "./features/HardBreak/HardBreak.js"
import { Heading, type NodeHeadingName } from "./features/Heading/Heading.js"
import { Highlight, type MarkHighlightName } from "./features/Highlight/Highlight.js"
import { History } from "./features/History/History.js"
import { Iframe, type NodeIframeName } from "./features/Iframe/Iframe.js"
import { Image } from "./features/Image/Image.js"
import { Link } from "./features/Link/Link.js"
import { Menus } from "./features/Menus/Menus.js"
import { type NodeTableCellName, type NodeTableHeaderName, type NodeTableName, type NodeTableRowName, TableExtensions } from "./features/Tables/index.js"

function stripShortcuts<T extends Node | Mark | Extension>(c: T): T {
	return c.extend({
		addKeyboardShortcuts() {
			return {}
		}
	}) as any
}

export const extensions: EditorOptions["extensions"] = [
	Document,
	Gapcursor,
	Dropcursor,
	// custom
	stripShortcuts(Paragraph.extend({
		group: "block"
	})),
	CommandBar,
	Base,
	List,
	Item,
	Heading,
	CodeBlock,
	Iframe,
	EmbeddedDocument,
	Link, // needs to be before other marks so we don't get link splitting
	HardBreak,
	Image,
	Highlight,
	...TableExtensions,
	...[

		// do not use configured extensions here
		// see https://github.com/ueberdosis/tiptap/issues/4081

		Text,
		// styling
		Blockquote,
		Cite,
		Code,
		Italic,
		Underline,
		Strike,
		Subscript,
		Superscript,

		Bold,
		// embedding
		// other
		History
	].map(e => stripShortcuts(e)),
	Menus
]

// mostly for the test builder, so we can have proper typing
// though the tests should use the full testExtensions
type NodeParagraphName = "paragraph"
type NodeTextName = "text"
type MarkHardBreakName = "hardBreak"
type MarkUnderlineName = "underline"
type MarkStrikeName = "strike"
type MarkSubscriptName = "subscript"
type MarkSuperscriptName = "superscript"
type MarkCodeName = "code"
type MarkItalicName = "italic"
type MarkBoldName = "bold"
type NodeImageName = "image"

const _schema = getSchema(extensions) as Schema<
	NodeListName
	| NodeItemName
	| NodeHeadingName
	| NodeDocumentName
	| NodeCodeBlockName
	| NodeIframeName
	| NodeEmbeddedDocumentName
	| NodeParagraphName
	| NodeTextName
	| NodeImageName
	| NodeTableName
	| NodeTableHeaderName
	| NodeTableRowName
	| NodeTableCellName
	| NodeBlockquoteName
	| NodeCiteName,
	| MarkHardBreakName
	| MarkHighlightName
	| MarkUnderlineName
	| MarkStrikeName
	| MarkSubscriptName
	| MarkSuperscriptName
	| MarkCodeName
	| MarkItalicName
	| MarkBoldName
	| MarkHighlightName
>
export const schema = _schema

