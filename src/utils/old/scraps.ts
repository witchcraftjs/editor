// import { sum_children } from "./sum_children"
// import { Filter } from "./types"

// import { EditorState } from "prosemirror-state"
// import { ResolvedPos } from "prosemirror-model"

// // function find_forward(
// // 	state: EditorState,
// // 	$parent: ResolvedPos,
// // 	filter: number | Filter,
// // ): ResolvedPos | undefined {
// // 	let $curr = $parent
// // 	while ($curr.node().childCount !== 0 && !$curr.node().isTextblock) {
// // 		// console.log($curr.node())
// // 		// debug($curr.node(), "curr")
// // 		if (filter === $curr.depth || !(typeof filter === "function" && filter($curr, $curr.depth, 0))) {
// // 			return $curr
// // 		}
// // 		$curr = state.doc.resolve($curr.start() + 2)
// // 	}
// // }
// function find_backwards(
// 	state: EditorState,
// 	$parent: ResolvedPos,
// 	start_index: number = 0,
// 	filter: number | Filter,
// ): ResolvedPos | undefined {

// 	if ($parent.node().childCount > 0) {
// 		for (let i = start_index; i >= 0; i--) {
// 			let $sibling = state.doc.resolve($parent.start() + sum_children($parent, i + 1) - 1)
// 			if (filter === i || (typeof filter === "function" && filter($sibling, $sibling.depth, i))) {
// 				return $sibling
// 			}
// 		}
// 	}
// 	return
// }
// import { ResolvedPos } from "prosemirror-model"

// /**
//  * @param $from position to start searching from
//  * @param start how many initial siblings back to start at
//  * @param step how many steps to go back at a time
//  * @param filter function that tells us whether to return the node or not OR the max number of loops to try
//  */
// function find_next(
// 	// 	state: EditorState,
// 	// 	$from: ResolvedPos,
// 	// 	start: number = 0,
// 	// 	step: number = 1,
// 	// 	filter: Filter | number = 0,
// ): ResolvedPos | undefined {
// 	// 	let $last = $from
// 	// 	let siblings_left = $from.node(-1).childCount - ($from.index($from.depth - 1) + 1)
// 	// 	for (let i = 0; i < siblings_left; i = i + step) {
// 	// 		let $pos = state.doc.resolve($last.pos + $last.node().nodeSize)
// 	// 		let index_in_parent = $pos.index($pos.depth - 1)
// 	// 		if (i >= start && (filter === i || (typeof filter === "function" && filter($pos, $from.depth, index_in_parent - i)))) {
// 	// 			return $pos
// 	// 		}
// 	// 		$last = $pos
// 	// 	}
// 	// 	return
// }
// const handle_list = (state: EditorState, dispatch?: Dispatch): boolean => {
// 	const { $from, $to } = state.selection
// 	const grandparent = $from.node(-1)

// 	if (
// 		$from.pos === $to.pos
// 		&& $from.pos === $from.start()
// 		&& grandparent.type === schema.nodes.list_item
// 	) {

// 		let tr = state.tr

// 		let $ancestor = closest_ancestor_with_sibling(state, $from, DIR.BACKWARDS)
// 		let prev_sibling = $ancestor?.nodeBefore

// 		if (!prev_sibling) {
// 			return false // let delete outdent the list item into a paragraph but not join with paragraph before
// 		}
// 		// debug(prev_sibling)
// 		// console.log($ancestor.index($ancestor.depth))


// 		let from = $from.pos - 4 // go up two nodes to the position of the previous sibling

// 		if (from <= 0) {
// 			return joinBackward(state, dispatch)
// 		} else {
// 			tr = state.tr
// 			tr.delete($from.pos - 4, $to.pos)
// 			if (dispatch) dispatch(tr)
// 		}
// 		return true
// 	}
// 	return false
// }

// import { EditorState } from "prosemirror-state"
// import { ResolvedPos, Node } from "prosemirror-model"
// export enum DIR {
// 	FORWARD,
// 	BACKWARDS,
// }

// export function closest_ancestor_with_sibling(state: EditorState, $pos: ResolvedPos, dir: DIR.FORWARD): ResolvedPos & { nodeAfter: NonNullable<ResolvedPos["nodeAfter"]> } | undefined
// export function closest_ancestor_with_sibling(state: EditorState, $pos: ResolvedPos, dir: DIR.BACKWARDS): ResolvedPos & { nodeBefore: NonNullable<ResolvedPos["nodeBefore"]> } | undefined
// export function closest_ancestor_with_sibling(state: EditorState, $pos: ResolvedPos, dir: DIR): ResolvedPos | undefined {
// 	for (let i = 1; i <= $pos.depth; i++) {
// 		if ($pos.index(i) > 0) {
// 			let pos = state.doc.resolve($pos.before($pos.depth - i))

// 			if (dir === DIR.BACKWARDS && pos.nodeBefore) {
// 				return pos
// 			} else if (dir === DIR.FORWARD && pos.nodeAfter) {
// 				return pos
// 			}
// 		}
// 	}
// 	return undefined
// }
