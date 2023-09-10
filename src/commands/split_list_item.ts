// import type { NodeType } from "prosemirror-model"
// import type { EditorState, NodeSelection } from "prosemirror-state"
// import { canSplit } from "prosemirror-transform"

// import type { Dispatch } from "@/components/Editor/types"


// export function split_list_item(type: NodeType) {
// 	return function(state: EditorState, dispatch: Dispatch): boolean {
// 		let { $from, $to, node } = state.selection as NodeSelection
// 		if (node) {debugger}

// 		if ((node?.isBlock) || $from.depth < 2 || !$from.sameParent($to)) {
// 			debugger
// 			return false
// 		}

// 		let grand_parent = $from.node(-1)

// 		if (grand_parent.type !== type) return false

// 		// if the selection is a collapsed selection at the end of a node:
// 		// - bla|
// 		// ^ get this type
// 		let next_type = $to.pos === $from.end()
// 			? grand_parent.contentMatchAt(0).defaultType
// 			: undefined
// 		if (next_type && next_type.name !== "paragraph") {debugger}

// 		let tr = state.tr
// 		tr.delete($from.pos, $to.pos)

// 		let types = next_type
// 			? [undefined, { type: next_type }] // ??? something about inner/outer types?
// 			: undefined

// 		if (!canSplit(tr.doc, $from.pos, 2, types)) return false

// 		if (dispatch) dispatch(tr.split($from.pos, 2, types as any).scrollIntoView())
// 		return true
// 	}
// }
