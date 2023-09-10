import type { Extension } from "@tiptap/core"
import TipTapImage from "@tiptap/extension-image"

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Image = (TipTapImage as any as Extension /* vue-tsc issue */).configure({
	HTMLAttributes: {
		class: `
			rounded-xs
			block h-auto max-w-full 
			[&.ProseMirror-selectednode]:outline
			[&.ProseMirror-selectednode]:outline-offset-0
			[&.ProseMirror-selectednode]:outline-accent-500
		`
	},
	allowBase64: true
})
