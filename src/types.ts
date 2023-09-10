export type DevListItem = {
	name: string
	level?: number
	children?: DevListItem[]
}


export type DevStringList = (string | [string, DevStringList] | DevStringList)[]


import type { Node, ResolvedPos } from "prosemirror-model"
import type { Transaction } from "prosemirror-state"
import type { Decoration } from "prosemirror-view"

// eslint-disable-next-line camelcase
import type { TaggedEvent_DragSelectionRestorer } from "./plugins/dragSelectionRestorer.js"
// eslint-disable-next-line camelcase
import type { TaggedEvent_UnfocusedSelectionIndicator } from "./plugins/unfocusedSelectionIndicator.js"
//

export type NodesBetweenFilter = (node: Node | null, start: number, parent: Node | null, index: number) => boolean | void

// export type Wrapper = { type: NodeType, attrs: object }

/**
 * @returns Returning true will stop the search and return the position at that point. Returning false or a falsy value will continue the search.
 */

export type Filter = ($pos: ResolvedPos, i: number) => boolean | void | undefined
export type SkipFilter = ($node: ResolvedPos, _i: number, main: Node) => ResolvedPos | void | undefined


export const SELF = -1
export const CHILD = 0
export const GRANDCHILD = 1
export const PARENT = 0
export const GRANDPARENT = 1
export const PREV = 0
export const NEXT = 0
// eslint-disable-next-line @typescript-eslint/naming-convention
export type REL = typeof SELF | typeof CHILD | typeof GRANDCHILD | typeof PARENT | typeof GRANDPARENT | typeof PREV | typeof NEXT

export type EqualSelection = { $start: ResolvedPos, $end: ResolvedPos } | { $start: undefined, $end: undefined }
export enum INSERT_TYPE {
	AFTER = "AFTER",
	BEFORE = "BEFORE",
	INSIDE = "INSIDE",
}

export const PREVENT = false
export const ALLOW = true
export type TaggedEvent<T> =
	& T
	// eslint-disable-next-line camelcase
	& TaggedEvent_DragSelectionRestorer<T>
	// eslint-disable-next-line camelcase
	& TaggedEvent_UnfocusedSelectionIndicator<T>


export type Rect = Partial<{
	top: number
	left: number
	width: number
	height: number
}>


export type HandleOptions = {
	container: FullHandleOptions["container"]
	start: FullHandleOptions["start"]
	end: FullHandleOptions["end"]
	modify?: FullHandleOptions["modify"]

	hoverDelay?: FullHandleOptions["hoverDelay"]

	classes?: Partial<FullHandleOptions["classes"]>
}
/**
 *The options to pass for allowing the creation of handle views.
 */
export type FullHandleOptions = {
	/**
	 * This element requires a container to be placed in. This should normally be the parent of the editor view's dom (**NOT** the editor itself).
	 */
	container: HTMLElement
	start: (deco: Decoration) => boolean
	/**
	 * These tell the node view which decorations to filter to determine the start/end positions. They are used for filters after which the first/last elements of the filtered array are used. So they could both be as simple as `deco => deco.type.attrs.class.includes(className)`.
	 */

	end: (deco: Decoration) => boolean
	/**
	 * Can be used to modify the transaction dispatched to set the selection, for example, to set metadata for other plugins to ignore this one, etc.
	 */
	modify?: (tr: Transaction) => void
	/**
	 * How much to delay before removing the element after removing the fade_in class (should be the length of your transition). 100 ms by default
	 */
	hoverDelay: number
	/** Can be used to override the various classes added. If they are not defined, the key's of this option are used but with dashes (e.g. `fade-in`), except for `view_hover` which will append `opts.handle.classes.handle` to the beginning.*/
	classes: {
		handle: string
		/**
		 * Added shortly after the element is added (not immediately so that transitions work).
		 */
		// _ is replaced with - to generate the class name
		// eslint-disable-next-line @typescript-eslint/naming-convention
		fade_in: string
		/**
		 * Like hover, but needed if you want to change the cursor, otherwise you won't be able to by just targeting the hover class. It needs to be set on something that does not have `pointer-events:none`.
		 */
		// eslint-disable-next-line @typescript-eslint/naming-convention
		view_hover: string
		/** The element needs to have `pointer-events:none` set so a class is added to element when you're hovering over it.*/
		hover: string
		/**
		 * The handle is removed and it's position cleared before dropping, then it's re-added. This class will be added when it's inserted and removed when the `fade_in` class is added. This makes is possible to make the handle not fade in when dropped.
		 */
		dropped: string
		/**
		 * This class is added when the selection is not just spanning a node and it's childre, i.e. it's crossing another node of the same depth.
		 */
		multiroot: string
	}
}
export type PluginListeners<T extends string> = Record<T, ((...args: any[]) => any)[]>
