import { Extension } from "@tiptap/core"

/** Extension for providing only the most basic shortcuts. */

// eslint-disable-next-line @typescript-eslint/naming-convention
export const BaseShortcuts = Extension.create({
	name: "BaseShortcuts",
	addKeyboardShortcuts() {
		/* eslint-disable @typescript-eslint/naming-convention */
		return {
			Backspace: () => this.editor.commands.backspace(),
			[`Ctrl-Backspace`]: () => this.editor.commands.deleteItem(),
			[`Ctrl-z`]: () => this.editor.commands.undo(),
			[`Ctrl-Shift-z`]: () => this.editor.commands.redo(),
			[`Ctrl-y`]: () => this.editor.commands.redo(),
			[`Ctrl-b`]: () => this.editor.commands.toggleBold(),
			[`Ctrl-i`]: () => this.editor.commands.toggleItalic(),
			Enter: () => this.editor.commands.enter(),
			[`Shift-Enter`]: () => this.editor.commands.first(({ commands }) => [
				() => commands.blockquoteShiftEnter(),
				() => commands.insertBreak()
			]),
			[`Ctrl-.`]: () => this.editor.commands.indentItem(),
			[`Ctrl-,`]: () => this.editor.commands.unindentItem(),
			[`Ctrl-Space`]: () => {
				return this.editor.commands.openItemMenu("item")
			},
			Escape: () => this.editor.commands.first(({ commands }) => [
				() => commands.closeLinkMenu(),
				() => commands.blur()
			]),
			Tab: () => this.editor.commands.codeBlockIndent(),
			[`Shift-Tab`]: () => this.editor.commands.codeBlockUnindent(),
			[`Ctrl-k`]: () => this.editor.commands.openLinkMenu(),
			[`Ctrl-Shift-k`]: () => this.editor.commands.openLinkMenu({ type: "internal" }),
			[`Ctrl-Alt-k`]: () => this.editor.commands.expandSelectionToLink()
		}
	}
})
