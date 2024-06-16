import { type Fragment, Node, type NodeType } from "prosemirror-model"

/**
 * Fixes certain deletion/replace (user) operations when the selection end is deeper than the selection start.
 *
 * Normally deleting (or selecting + inserting/pasting) selections like the following leaves behind empty items.
 *
 * What this does is if the selection would leave behind empty items to fill in the depth, it removes them, and if necessary un-indents the items that follow the selection until they have a valid parent (i.e. the start of the selection). In the case of pasting, we attempt to fill with the paste (if it is not simple text), otherwise unindent.
 *
 * \* Exceptions were prosemirror will handle things fine are noted with a \*.
 *
 * **Parent => Descendant Selection (> 1 level away)**
 * ```txt
 * - A[0
 * 	- B0 * start/end cursor is here
 * 		- C]0
 * 			- D0 * end cursor is here and is the last item under A0
 * 			- D1
 * 				- F0
 * 		- C1
 * 			- D2
 * 	- B1
 * 		- C2 * end cursor is here
 *
 * Default deletion behavior:
 * - A|0
 * 	-
 * 		-
 * 			- D0
 * 				- F0
 * 		- C1
 * 			- D2
 * 	- B1
 * 		- C2
 *
 * Fixed behavior:
 * - A|0
 * 	- D0
 * 		- F0
 * 	- C1
 * 		- D2
 * 	- B1
 * 		- C2
 * ```
 * **Higher => Lower Selection in Other Branch (> 1 level away)**
 * ```txt
 * - A[0
 * 	- B0
 * 		- C0
 * 			- D0
 * - A1
 * 	- B1 * end cursor is here <= 1 level away, e.g. A->B, B->C
 * 		- C]1
 * 			- D1
 * 				- F0
 * 		- C1
 * 			- D2
 * 	- B1 * end cursor is here <= 1 level away
 * 		- C2 * end cursor is here
 *
 * Default deletion behavior:
 * - A|0
 * 	-
 * 		-
 * 			- D1
 * 				- F0
 * 		- C1
 * 			- D2
 * 	- B1
 * 		- C2
 *
 * Fixed behavior:
 * - A|0
 * 	- D0
 * 	- D1
 * 		- F0
 * 	- C1
 * 		- D2
 * 	- B1
 * 		- C2
 * ```
 * For all other selections, (e.g. Lower => Higher Selection in Other Branch), prosemirror seems to handle them correctly.
 *
 * **Using**
 *
 * This plugin must be passed an instance of the view since it needs to be able to cancel transactions completely *then* dispatch a new one with the correct behavior.
 * So it cannot be passed to the plugins array normally, since at that point the editor variable does not yet exist. It must be pushed to the plugins list after the editor view exists. A helper function, `applyListFixer` is provided to make this simpler.
 *
 * ```ts
 * let editor = new EditorView(el, {
 * 	state: EditorState.create({
 * 		// ...
 * 		plugins: [
 * 			// editor is not defined here
 * 		],
 * 	}),
 * })
 * // manually
 * editor.state.plugins.push(list_fixer({ itemType, containerType, view: editor }))
 * // with helper
 * applyListFixer({ itemType, containerType, view: editor })
 * ```
 *
 * Notes:
 * - This plugin assumes items only contain one type of content node (e.g. one paragraph, one image, or a wrapper containing multiple nodes, etc). Otherwise, for example, if there are two paragraphs in an item, the empty content count will be off.
 * - This plugin relies on the history plugin storing it's metadata with the `history$` key.
 * - This plugin will not handle multiple steps or states that did not have a selection. This means tr.delete/replace in another plugin might trigger this one under certain conditions. This should not be a problem, since the conditions must have been met and the delete must have been wrong. BUT, this does means that multiple wrong deletes are ignored. While the fixing of the deletions for multiple steps is easy to implement, the problem is determining what where the original positions passed to the replace/delete/etc command based on just the steps (without relying on the selection) is impossible. For example, a step might replace and entire tree of nodes (and that's all the info we can get, which ranges it touched), but it might not have been the intention to actually do that.
 */
export function flattenNodes(
	content: Node | Fragment,
	container: NodeType,
	/** Nodes to not count as empty content nodes. */
	filter: (node: Node) => boolean
): Node {
	const flattened: Node[] = []
	content.nodesBetween(0, content instanceof Node ? content.nodeSize - 2 : content.size, node => {
		if (filter(node)) {
			flattened.push(node)
			return false
		}
		return true
	})
	return container.create(undefined, flattened)
}
