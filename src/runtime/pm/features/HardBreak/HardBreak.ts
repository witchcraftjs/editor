import { HardBreak as TipTapHardBreak } from "@tiptap/extension-hard-break"
/**
 * Extends the tiptap hard break extension to set the linebreakReplacement option (which tiptap does not expose).
 * This option tells prosemirror that when converting between blocks that can/can't show whitespace, it should use this node type to represent line breaks in node types that don't display them.
 */

// eslint-disable-next-line @typescript-eslint/naming-convention
export const HardBreak = TipTapHardBreak.extend({
	extendNodeSchema(extension) {
		// this is called multiple timese, once per node type ???
		if (extension.name === "hardBreak") {
			return {
				linebreakReplacement: true
			}
		}
		return {}
	},
	addKeyboardShortcuts() {
		return {}
	}
})
