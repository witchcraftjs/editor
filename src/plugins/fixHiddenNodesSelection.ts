import { GapCursor } from "prosemirror-gapcursor"
import type { ResolvedPos } from "prosemirror-model"
import { Plugin, PluginKey, TextSelection } from "prosemirror-state"


const isHidden = ($pos: ResolvedPos) => {
	for (let i = $pos.depth; i > 0; i--) {
		const node = $pos.node(i)
		if (node.attrs.hidden) {
			return true
		}
	}
	return false
}

export const fixHiddenNodesSelection = function(): Plugin {
	const key = new PluginKey("fixHiddenNodesSelection")
	return new Plugin({
		key,
		appendTransaction: (trs, oldState, state) => {
			const { from, to } = state.selection
			if (from !== to) return
			const selectionSet = trs.find(tr => tr.selectionSet)
			//
			// if (selectionSet && posHidden(state.selection.$from)) {
			// 	const dir = state.selection.from > oldState.selection.from ? 1 : -1
			// 	let newPos = state.selection.from,
			// 		hidden = true,
			// 		validTextSelection = false,
			// 		validGapCursor = false,
			// 		$pos
			// 	while (hidden || (!validGapCursor && !validTextSelection)) {
			// 		newPos += dir
			// 		if (newPos === 0 || newPos === state.doc.nodeSize) {
			// 			// Could not find any valid position
			// 			return
			// 		}
			// 		$pos = state.doc.resolve(newPos)
			// 		validTextSelection = $pos.parent.inlineContent
			// 		validGapCursor = GapCursor.valid($pos)
			// 		hidden = posHidden($pos)
			// 	}
			// 	const selection = validTextSelection ? new TextSelection($pos) : new GapCursor($pos)
			// 	return state.tr.setSelection(selection)
			// }
		},
	})
}
