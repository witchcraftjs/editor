import type { Command, Dispatch } from "@tiptap/core"

import { debugNode } from "../../../utils/internal/debugNode.js"

declare module "@tiptap/core" {

	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		focusCodeBlockLanguage: {
			focusCodeBlockLanguage: (dir: "up" | "down") => ReturnType
		}
	}
}

function focusInput(domNode: Node, langPickerClass: string, dispatch: Dispatch): boolean {
	if (domNode instanceof HTMLElement) {
		const langPickerEl = domNode.querySelector(`.${langPickerClass}`)
		if (langPickerEl instanceof HTMLElement) {
			if (dispatch) {
				langPickerEl.focus()
			}
			return true
		}
	}
	return false
}

export const focusCodeBlockLanguage = (
	codeBlockType: string,
	langPickerClass: string = "lang-picker-input"
) =>
	(): Command =>
		({ state, tr, view, dispatch }) => {
			const { from, empty } = state.selection.map(tr.doc, tr.mapping)
			if (!empty) { return false }
			const $node = tr.doc.resolve(from)
			debugNode($node.node())
			const isCodeBlock = $node.node()?.type.name === codeBlockType
			if (isCodeBlock) {
				const domNode = view.domAtPos($node.start(-1)).node
				return focusInput(domNode, langPickerClass, dispatch)
			}
			return false
		}
