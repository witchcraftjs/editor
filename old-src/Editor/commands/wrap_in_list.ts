// import { AttributeSpec, Fragment, NodeRange, NodeSpec, NodeType, Slice } from "prosemirror-model"
// import type { EditorState, Transaction } from "prosemirror-state"
// import { canSplit, findWrapping, ReplaceAroundStep } from "prosemirror-transform"

// import type { Dispatch, Wrapper } from "@/components/Editor/types"

// import { schema } from "../schema"


// export function wrap_in_list(node_type: NodeType, attrs?: AttributeSpec) {
// 	return function(state: EditorState, dispatch?: Dispatch): boolean {
// 		let { $from, $to } = (state).selection
// 		const grandparent = $from.node(-1)
// 		let is_already_list = grandparent.type === schema.nodes.list_item

// 		if (!is_already_list) {
// 			let range = $from.blockRange($to)
// 			if (!range) return false

// 			let is_trailing_start =
// 			$from.textOffset === 0
// 			&& !!$from.nodeBefore
// 			&& $from.pos !== $to.pos
// 			let is_trailing_end =
// 			$to.textOffset === 0
// 			&& !!$to.nodeAfter
// 			&& $from.pos !== $to.pos

// 			if (is_trailing_start) {
// 				let from = state.doc.resolve($from.pos + $from.parentOffset)
// 				range = from.blockRange($to)
// 			}
// 			if (is_trailing_end) {
// 				let to = state.doc.resolve($to.pos - $to.parentOffset - 1)
// 				range = $from.blockRange(to)
// 			}

// 			if (!range) { return false }

// 			let join = false
// 			let outer_range = range
// 			// // This is at the top of an existing list item
// 			// if (range.depth >= 2 && $from.node(range.depth - 1).type.compatibleContent(node_type) && range.startIndex === 0) {
// 			// 	// Don't do anything if this is the top of the list
// 			// 	if ($from.index(range.depth - 1) === 0)
// 			// 	{return false}
// 			// 	let $insert = state.doc.resolve(range.start - 2)
// 			// 	outer_range = new NodeRange($insert, $insert, range.depth)
// 			// 	if (range.endIndex < range.parent.childCount) {
// 			// 		range = new NodeRange($from, state.doc.resolve($to.end(range.depth)), range.depth)
// 			// 	}
// 			// 	join = true
// 			// }
// 			let wrap = findWrapping(outer_range, node_type, attrs, range)
// 			if (!wrap) { return false }
// 			if (dispatch) {
// 				let tr = wrap_nodes(state.tr, range, wrap as Wrapper[], join, node_type)
// 					.scrollIntoView()
// 				dispatch(tr)
// 			}
// 			return true
// 		} else {
// 			return false
// 		}
// 	}
// }


// export function wrap_nodes(tr: Transaction, range: NodeRange, wrappers: Wrapper[], join: boolean, node_type: NodeSpec): Transaction {
// 	// ??? is it ever not ul/ol -> li ?
// 	if (wrappers.length !== 2
// 		|| (wrappers[0].type.name !== "bullet_list"
// 			&& wrappers[0].type.name !== "ordered_list")
// 		|| wrappers[1].type.name !== "list_item") {
// 		// reverse the wrappers
// 		// let content = wrappers
// 		// 	.reverse()
// 		// 	.reduce((prev, curr) => Fragment.from(curr.type.create(curr.attrs, prev)), Fragment.empty)
// 		debugger
// 	}
// 	// creates a ul -> li slice
// 	let parent_node = wrappers[0]
// 	let child_node = wrappers[1]
// 	let child_fragment = Fragment.from(child_node.type.create(child_node.attrs, Fragment.empty))
// 	let parent_fragment = Fragment.from(parent_node.type.create(parent_node.attrs, child_fragment))
// 	// turn the fragments into a closed slice
// 	let slice = new Slice(parent_fragment, 0, 0)
// 	let start_offset = (join
// 		? 2 // subtract node end positions ?
// 		: 0)
// 	tr.step(new ReplaceAroundStep(range.start - start_offset, range.end, range.start, range.end, slice, wrappers.length, true))
// 	// this wraps all our paragraphs in the ul -> li slice like:
// 	// ul -> li -> p[]
// 	let index_of_node_type = wrappers.findIndex(wrapper => wrapper.type === node_type)
// 	// by splitting each p we can get:
// 	// ul -> (li -> p)[]
// 	let depth = wrappers.length - 1 - index_of_node_type
// 	let pos = range.start + wrappers.length - start_offset
// 	let parent = range.parent
// 	for (let i = range.startIndex; i < range.endIndex; i++) {
// 		let child = parent.child(i)
// 		let is_first = i === range.startIndex
// 		let can = canSplit(tr.doc, pos, depth)
// 		if (!is_first && can) {
// 			tr.split(pos, depth)
// 			pos += 2 * depth // add all the end positions of nodes
// 		}
// 		pos += child.nodeSize
// 	}
// 	return tr
// }
