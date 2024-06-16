import type { Node, NodeType } from "prosemirror-model"
import type { Command } from "prosemirror-state"


export type DevListItem = {
	name: string
	type: string
	level?: number
	children?: DevListItem[]
}


export type DevStringList = (string | ([string, string] | string)[] | DevStringList[])[]


export type NodesBetweenFilter = (node: Node | null, start: number, parent: Node | null, index: number) => boolean | void


export type CommandGroup = {
	create: (...args: any) => (...args: any) => Command
	
}
export type CoreCommands<
	TRawCommands extends Record<string, CommandGroup>,
	TReturn,
> = {
	[key in keyof TRawCommands]: (...args: Parameters<ReturnType<TRawCommands[key]["create"]>>) => TReturn
}

export type PmPoint = { left: number, top: number }
export type Point = { x: number, y: number }

export type CssVariables = {
	// gripDotsSize: `${number}px`,
	// selectionGripSize: `${number}px`,
	itemLeftMargin: string
	handleMargin: string
	handleSize: string
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
	nodeType: NodeType
	/**
	 * To properly get all the nodes inside the selection of the wanted type/s, we need to know how far they are, depth-wise from the inline selection. The default is -1, the parent node around the text, but sometimes we might want to target nodes farther up.
	 *
	 * ```
	 * ListItem(P(Te|xt))
	 * ^-2      ^-1 ^0
	 * ```
	 *
	 */
	shift?: number

}
export type CommandFallbackNodesOptions = {
	/** If specified, nodes in these groups will be converted to the given nodeType. */
	fallbackGroups?: string[]
	/** Like fallbackGroups but for specific nodes. */
	fallbackNodeTypeNames?: string[]
}

