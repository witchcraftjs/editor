// import type { NodeType } from "prosemirror-model"
// import type { EditorState, NodeSelection } from "prosemirror-state"
// import { canSplit } from "prosemirror-transform"


// export function splitListItem(type: NodeType) {
// 	return function(state: EditorState, dispatch: Dispatch): boolean {
// 		let { $from, $to, node } = state.selection as NodeSelection
// 		if (node) {debugger}

// 		if ((node?.isBlock) || $from.depth < 2 || !$from.sameParent($to)) {
// 			debugger
// 			return false
// 		}

// 		let grandParent = $from.node(-1)

// 		if (grandParent.type !== type) return false

// 		// if the selection is a collapsed selection at the end of a node:
// 		// - bla|
// 		// ^ get this type
// 		let nextType = $to.pos === $from.end()
// 			? grandParent.contentMatchAt(0).defaultType
// 			: undefined
// 		if (nextType && nextType.name !== "paragraph") {debugger}

// 		let tr = state.tr
// 		tr.delete($from.pos, $to.pos)

// 		let types = nextType
// 			? [undefined, { type: nextType }] // ??? something about inner/outer types?
// 			: undefined

// 		if (!canSplit(tr.doc, $from.pos, 2, types)) return false

// 		if (dispatch) dispatch(tr.split($from.pos, 2, types as any).scrollIntoView())
// 		return true
// 	}
// }
