// import { findWrapping, liftTarget, canSplit as canSplit, ReplaceAroundStep } from "prosemirror-transform"
// import { Slice, Fragment, NodeRange, Node, Transaction, NodeSpec } from "prosemirror-model"
// import { TextSelection, EditorState } from "prosemirror-state"
// import { autoJoin } from "prosemirror-commands"

// const olDOM = ["ol", 0], ulDOM = ["ul", 0], liDOM = ["li", 0]

// // :: NodeSpec
// // An ordered list [node spec](#model.NodeSpec). Has a single
// // attribute, `order`, which determines the number at which the list
// // starts counting, and defaults to 1. Represented as an `<ol>`
// // element.
// export const orderedList = {
// 	group: "block",
// 	content: "list_item+",
// 	attrs: { order: { default: 1 } },
// 	parseDOM: [{ tag: "ol", getAttrs(dom) {
// 		return { order: dom.hasAttribute("start") ? +dom.getAttribute("start") : 1 }
// 	} }],
// 	toDOM(node) {
// 		return node.attrs.order === 1 ? olDOM : ["ol", { start: node.attrs.order }, 0]
// 	},
// }

// // :: NodeSpec
// // A bullet list node spec, represented in the DOM as `<ul>`.
// export const bulletList = {
// 	group: "block",
// 	content: "list_item+",
// 	parseDOM: [{ tag: "ul" }],
// 	toDOM() { return ulDOM },
// }

// export const listItem = {
// 	content: "(paragraph) (paragraph | bulletList | orderedList)*",
// 	parseDOM: [{ tag: "li" }],
// 	toDOM() { return liDOM },
// 	defining: true,
// }

// function add(obj, props) {
// 	let copy = {}
// 	for (let prop in obj) copy[prop] = obj[prop]
// 	for (let prop in props) copy[prop] = props[prop]
// 	return copy
// }

// // :: (OrderedMap<NodeSpec>, string, ?string) → OrderedMap<NodeSpec>
// // Convenience function for adding list-related node types to a map
// // specifying the nodes for a schema. Adds
// // [`orderedList`](#schema-list.orderedList) as `"ordered_list"`,
// // [`bulletList`](#schema-list.bulletList) as `"bullet_list"`, and
// // [`listItem`](#schema-list.listItem) as `"list_item"`.
// //
// // `itemContent` determines the content expression for the list items.
// // If you want the commands defined in this module to apply to your
// // list structure, it should have a shape like `"paragraph block*"` or
// // `"paragraph (ordered_list | bullet_list)*"`. `listGroup` can be
// // given to assign a group name to the list node types, for example
// // `"block"`.
// export function addListNodes(nodes, itemContent, listGroup) {
// 	return nodes.append({
// 		ordered_list: add(orderedList, { content: "list_item+", group: listGroup }),
// 		bullet_list: add(bulletList, { content: "list_item+", group: listGroup }),
// 		list_item: add(listItem, { content: itemContent }),
// 	})
// }

// // :: (NodeType, ?Object) → (state: EditorState, dispatch: ?(tr: Transaction)) → bool
// // Returns a command function that wraps the selection in a list with
// // the given type an attributes. If `dispatch` is null, only return a
// // value to indicate whether this is possible, but don't actually
// // perform the change.
// export function wrapInList(node_type: NodeSpec, attrs: any) {
// 	return function(state: EditorState, dispatch) {
// 		let { $from, $to } = (state).selection
// 		let range = $from.blockRange($to)

// 		let is_trailing_start = $from.textOffset === 0 && $from.nodeBefore

// 		if (is_trailing_start) {
// 			let from = state.doc.resolve($from.pos + $from.parentOffset )
// 			range = from.blockRange($to)
// 			;({ $from, $to } = (state).selection)
// 		}
// 		let is_trailing_end = $to.textOffset === 0 && $to.nodeAfter
// 		if (is_trailing_end) {
// 			let to = state.doc.resolve($to.pos - $to.parentOffset - 1)
// 			range = $from.blockRange(to)
// 			;({ $from, $to } = (state).selection)
// 		}

// 		let join = false
// 		let outer_range = range
// 		if (!range) return false
// 		// This is at the top of an existing list item
// 		if (range.depth >= 2 && $from.node(range.depth - 1).type.compatibleContent(node_type) && range.startIndex === 0) {
// 			// Don't do anything if this is the top of the list
// 			if ($from.index(range.depth - 1) === 0) return false
// 			let $insert = state.doc.resolve(range.start - 2)
// 			outer_range = new NodeRange($insert, $insert, range.depth)
// 			if (range.endIndex < range.parent.childCount)
// 			{range = new NodeRange($from, state.doc.resolve($to.end(range.depth)), range.depth)}
// 			join = true
// 		}
// 		let wrap = findWrapping(outer_range, node_type, attrs, range)
// 		console.log(wrap)

// 		if (!wrap) return false
// 		if (dispatch) dispatch(wrap_in_list(state.tr, range, wrap, join, node_type).scrollIntoView())
// 		return true
// 	}
// }

// function wrap_in_list(tr: Transaction, range: NodeRange, wrappers: Node[], join: boolean, node_type: NodeSpec): Transaction {
// 	// ??? is it ever not ul/ol -> li ?
// 	if (
// 		wrappers.length !== 2
// 		|| (
// 				wrappers[0].type.name !== "bullet_list"
// 			&& wrappers[0].type.name !== "ordered_list"
// 		)
// 		|| wrappers[1].type.name !== "list_item"
// 	) {
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

// 	let start_offset = (
// 		join
// 			? 2 // subtract node end positions ?
// 			: 0
// 	)
// 	tr.step(new ReplaceAroundStep(
// 		range.start - start_offset, range.end,
// 		range.start, range.end,
// 		slice, wrappers.length,
// 		true, // https://discuss.prosemirror.net/t/confused-about-the-structure-option-on-replacestep-replacearoundstep/1457/3
// 	))
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

// // :: (NodeType) → (state: EditorState, dispatch: ?(tr: Transaction)) → bool
// // Build a command that splits a non-empty textblock at the top level
// // of a list item by also splitting that list item.
// export function splitListItem(itemType) {
// 	return function(state, dispatch) {
// 		let { $from, $to, node } = state.selection
// 		if ((node && node.isBlock) || $from.depth < 2 || !$from.sameParent($to)) return false
// 		let grandParent = $from.node(-1)
// 		if (grandParent.type != itemType) return false
// 		if ($from.parent.content.size === 0) {
// 			// In an empty block. If this is a nested list, the wrapping
// 			// list item should be split. Otherwise, bail out and let next
// 			// command handle lifting.
// 			if ($from.depth === 2 || $from.node(-3).type != itemType ||
// 				$from.index(-2) != $from.node(-2).childCount - 1) return false
// 			if (dispatch) {
// 				let wrap = Fragment.empty, keepItem = $from.index(-1) > 0
// 				// Build a fragment containing empty versions of the structure
// 				// from the outer list item to the parent node of the cursor
// 				for (let d = $from.depth - (keepItem ? 1 : 2); d >= $from.depth - 3; d--)
// 				{wrap = Fragment.from($from.node(d).copy(wrap))}
// 				// Add a second list item with an empty default start node
// 				wrap = wrap.append(Fragment.from(itemType.createAndFill()))
// 				let tr = state.tr.replace($from.before(keepItem ? null : -1), $from.after(-3), new Slice(wrap, keepItem ? 3 : 2, 2))
// 				tr.setSelection(state.selection.constructor.near(tr.doc.resolve($from.pos + (keepItem ? 3 : 2))))
// 				dispatch(tr.scrollIntoView())
// 			}
// 			return true
// 		}
// 		let nextType = $to.pos === $from.end() ? grandParent.contentMatchAt(0).defaultType : null
// 		let tr = state.tr.delete($from.pos, $to.pos)
// 		let types = nextType && [null, { type: nextType }]
// 		if (!canSplit(tr.doc, $from.pos, 2, types)) return false
// 		if (dispatch) dispatch(tr.split($from.pos, 2, types).scrollIntoView())
// 		return true
// 	}
// }

// // :: (NodeType) → (state: EditorState, dispatch: ?(tr: Transaction)) → bool
// // Create a command to lift the list item around the selection up into
// // a wrapping list.
// export function liftListItem(itemType) {
// 	return function(state, dispatch) {
// 		let { $from, $to } = state.selection
// 		let range = $from.blockRange($to, node => node.childCount && node.firstChild.type === itemType)
// 		if (!range) return false
// 		if (!dispatch) return true
// 		if ($from.node(range.depth - 1).type === itemType) // Inside a parent list
// 		{return liftToOuterList(state, dispatch, itemType, range)}
// 		else // Outer list node
// 		{return liftOutOfList(state, dispatch, range)}
// 	}
// }

// function liftToOuterList(state, dispatch, itemType, range) {
// 	let tr = state.tr, end = range.end, endOfList = range.$to.end(range.depth)
// 	if (end < endOfList) {
// 		// There are siblings after the lifted items, which must become
// 		// children of the last item
// 		tr.step(new ReplaceAroundStep(end - 1, endOfList, end, endOfList,
// 			new Slice(Fragment.from(itemType.create(null, range.parent.copy())), 1, 0), 1, true))
// 		range = new NodeRange(tr.doc.resolve(range.$from.pos), tr.doc.resolve(endOfList), range.depth)
// 	}
// 	dispatch(tr.lift(range, liftTarget(range)).scrollIntoView())
// 	return true
// }

// function liftOutOfList(state, dispatch, range) {
// 	let tr = state.tr, list = range.parent
// 	// Merge the list items into a single big item
// 	for (let pos = range.end, i = range.endIndex - 1, e = range.startIndex; i > e; i--) {
// 		pos -= list.child(i).nodeSize
// 		tr.delete(pos - 1, pos + 1)
// 	}
// 	let $start = tr.doc.resolve(range.start), item = $start.nodeAfter
// 	let atStart = range.startIndex === 0, atEnd = range.endIndex === list.childCount
// 	let parent = $start.node(-1), indexBefore = $start.index(-1)
// 	if (!parent.canReplace(indexBefore + (atStart ? 0 : 1), indexBefore + 1,
// 		item.content.append(atEnd ? Fragment.empty : Fragment.from(list))))
// 	{return false}
// 	let start = $start.pos, end = start + item.nodeSize
// 	// Strip off the surrounding list. At the sides where we're not at
// 	// the end of the list, the existing list is closed. At sides where
// 	// this is the end, it is overwritten to its end.
// 	tr.step(new ReplaceAroundStep(start - (atStart ? 1 : 0), end + (atEnd ? 1 : 0), start + 1, end - 1,
// 		new Slice((atStart ? Fragment.empty : Fragment.from(list.copy(Fragment.empty)))
// 			.append(atEnd ? Fragment.empty : Fragment.from(list.copy(Fragment.empty))),
// 			atStart ? 0 : 1, atEnd ? 0 : 1), atStart ? 0 : 1))
// 	dispatch(tr.scrollIntoView())
// 	return true
// }

// // :: (NodeType) → (state: EditorState, dispatch: ?(tr: Transaction)) → bool
// // Create a command to sink the list item around the selection down
// // into an inner list.
// export function sinkListItem(itemType) {
// 	return function(state, dispatch) {
// 		let { $from, $to } = state.selection
// 		let range = $from.blockRange($to, node => node.childCount && node.firstChild.type === itemType)
// 		if (!range) return false
// 		let startIndex = range.startIndex
// 		if (startIndex === 0) return false
// 		let parent = range.parent, nodeBefore = parent.child(startIndex - 1)
// 		if (nodeBefore.type != itemType) return false

// 		if (dispatch) {
// 			let nestedBefore = nodeBefore.lastChild && nodeBefore.lastChild.type === parent.type
// 			let inner = Fragment.from(nestedBefore ? itemType.create() : null)
// 			let slice = new Slice(Fragment.from(itemType.create(null, Fragment.from(parent.type.create(null, inner)))),
// 					nestedBefore ? 3 : 1, 0)
// 			let before = range.start, after = range.end
// 			dispatch(state.tr.step(new ReplaceAroundStep(before - (nestedBefore ? 3 : 1), after,
// 				before, after, slice, 1, true))
// 				.scrollIntoView())
// 		}
// 		return true
// 	}
// }
