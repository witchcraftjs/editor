import type { Node } from "@tiptap/pm/model"

export * from "../pm/features/Link/types.js"
export * from "../pm/features/Base/types.js"
export * from "../pm/features/Menus/types.js"
export * from "../pm/features/Blocks/types.js"
export * from "../pm/features/CommandsMenus/types.js"
export * from "../pm/features/CodeBlock/types.js"
export * from "../pm/features/FileLoader/types.js"
export * from "../pm/features/DocumentApi/types.js"
export * from "../pm/features/EmbeddedDocument/types.js"

export type NodesBetweenFilter = (node: Node | null, start: number, parent: Node | null, index: number) => boolean

export type PmPoint = { left: number, top: number }
export type Point = { x: number, y: number }

export type CssVariables = {
	/** The space between the node type indicator and the node. */
	pmNodeTypeMargin: string
	pmUnfocusedSelectionColor: string
	/**
	 * The background color for the code blocks.
	 * This has not effect unless you've injected the css. See {@link useHighlightJsTheme}.
	 */
	pmCodeBlockBgColor: string
	pmMaxEmbedWidth: string
	pmDragScrollMargin: string
	// the following are not prefixed with pm since the drag handle itself is from the ui library
	/** The space between the handle and the node type indicator or node. */
	dragHandleMargin: string
	/** The size of the draggable handle. */
	dragHandleSize: string
	dragHandleImage: string
	dragHandleCollapseIndicatorImage: string
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type HTMLAttributesOptions = {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	HTMLAttributes: Record<string, any>
}

export type CommandAttributeOptions<T> = CommandNodeOptions & {
	attributeKey: string
	allowedValues: T[]
}
export type CommandNodeOptions = {
	nodeType: string
}
export type CommandToggleNodesOptions = {
	/** Like {@link toggleNodeTypeNames}, but for groups. */
	toggleGroups?: string[]
	/** A list of node types that can be converted to the wanted node type. */
	toggleNodeTypeNames?: string[]
}
