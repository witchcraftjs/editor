// import { AttributeSpec, Fragment, NodeRange, NodeSpec, NodeType, Slice } from "prosemirror-model"
// import type { EditorState, Transaction } from "prosemirror-state"
// import { canSplit, findWrapping, ReplaceAroundStep } from "prosemirror-transform"


// export function wrapInList(node_type: NodeType, attrs?: AttributeSpec) {
// 	return function(state: EditorState, dispatch?: Dispatch): boolean {
// 		let { $from, $to } = (state).selection
// 		const grandparent = $from.node(-1)
// 		let isAlreadyList = grandparent.type === schema.nodes.list_item

// 		if (!isAlreadyList) {
// 			let range = $from.blockRange($to)
// 			if (!range) return false

// 			let isTrailingStart =
// 			$from.textOffset === 0
// 			&& !!$from.nodeBefore
// 			&& $from.pos !== $to.pos
// 			let isTrailingEnd =
// 			$to.textOffset === 0
// 			&& !!$to.nodeAfter
// 			&& $from.pos !== $to.pos

// 			if (isTrailingStart) {
// 				let from = state.doc.resolve($from.pos + $from.parentOffset)
// 				range = from.blockRange($to)
// 			}
// 			if (isTrailingEnd) {
// 				let to = state.doc.resolve($to.pos - $to.parentOffset - 1)
// 				range = $from.blockRange(to)
// 			}

// 			if (!range) { return false }

// 			let join = false
// 			let outerRange = range
// 			// // This is at the top of an existing list item
// 			// if (range.depth >= 2 && $from.node(range.depth - 1).type.compatibleContent(nodeType) && range.startIndex === 0) {
// 			// 	// Don't do anything if this is the top of the list
// 			// 	if ($from.index(range.depth - 1) === 0)
// 			// 	{return false}
// 			// 	let $insert = state.doc.resolve(range.start - 2)
// 			// 	outerRange = new NodeRange($insert, $insert, range.depth)
// 			// 	if (range.endIndex < range.parent.childCount) {
// 			// 		range = new NodeRange($from, state.doc.resolve($to.end(range.depth)), range.depth)
// 			// 	}
// 			// 	join = true
// 			// }
// 			let wrap = findWrapping(outerRange, nodeType, attrs, range)
// 			if (!wrap) { return false }
// 			if (dispatch) {
// 				let tr = wrapNodes(state.tr, range, wrap as Wrapper[], join, nodeType)
// 					.scrollIntoView()
// 				dispatch(tr)
// 			}
// 			return true
// 		} else {
// 			return false
// 		}
// 	}
// }


// export function wrapNodes(tr: Transaction, range: NodeRange, wrappers: Wrapper[], join: boolean, nodeType: NodeSpec): Transaction {
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
// 	let parentNode = wrappers[0]
// 	let childNode = wrappers[1]
// 	let childFragment = Fragment.from(childNode.type.create(childNode.attrs, Fragment.empty))
// 	let parentFragment = Fragment.from(parentNode.type.create(parentNode.attrs, childFragment))
// 	// turn the fragments into a closed slice
// 	let slice = new Slice(parentFragment, 0, 0)
// 	let startOffset = (join
// 		? 2 // subtract node end positions ?
// 		: 0)
// 	tr.step(new ReplaceAroundStep(range.start - startOffset, range.end, range.start, range.end, slice, wrappers.length, true))
// 	// this wraps all our paragraphs in the ul -> li slice like:
// 	// ul -> li -> p[]
// 	let indexOfNodeType = wrappers.findIndex(wrapper => wrapper.type === nodeType)
// 	// by splitting each p we can get:
// 	// ul -> (li -> p)[]
// 	let depth = wrappers.length - 1 - indexOfNodeType
// 	let pos = range.start + wrappers.length - startOffset
// 	let parent = range.parent
// 	for (let i = range.startIndex; i < range.endIndex; i++) {
// 		let child = parent.child(i)
// 		let isFirst = i === range.startIndex
// 		let can = canSplit(tr.doc, pos, depth)
// 		if (!isFirst && can) {
// 			tr.split(pos, depth)
// 			pos += 2 * depth // add all the end positions of nodes
// 		}
// 		pos += child.nodeSize
// 	}
// 	return tr
// }
