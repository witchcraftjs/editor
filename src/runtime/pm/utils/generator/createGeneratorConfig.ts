import type { Mark, Node } from "@tiptap/pm/model"
import type { builders } from "prosemirror-test-builder"

export function createGeneratorConfig<
	TBuilder extends ReturnType<typeof builders>,
	TChildType extends "node" | "text",
	TParentType extends "node" | "text",
	TChildNodeType extends TChildType extends "node" ? Node : (Mark | string),
	TParentNodeType extends TParentType extends "node" ? Node : (Mark | string)
>(
	config: GeneratorConfigEntry<TBuilder, TChildType, TParentType, TChildNodeType, TParentNodeType>
): GeneratorConfigEntry<TBuilder, TChildType, TParentType, TChildNodeType, TParentNodeType> {
	return config
}

export type GeneratorConfigEntry<
	TBuilder extends ReturnType<typeof builders>,
	TChildType extends "node" | "text" = "node" | "text",
	TParentType extends "node" | "text" = "node" | "text",
	TChildNodeType extends TChildType extends "node" ? Node : (Mark | string) = TChildType extends "node" ? Node : (Mark | string),
	TParentNodeType extends TParentType extends "node" ? Node : (Mark | string) = TParentType extends "node" ? Node : (Mark | string)
> = {
	/**
	 * Creates the node. Can return undefined to "terminate" the branch being created, the node will be filtered out of the nodes passed to it's parent.
	 *
	 * Note also, it is not required to use the children. You can ignore them or use a subset or create different ones if needed (some node types *require* text and if count returns 0 children will be empty, which can cause issues).
	 */
	create: (pm: TBuilder, parentType: string, children: TChildNodeType[]) => TParentNodeType | undefined
	parents: {
		/**
		 * The type of the parent (node or "text") where "text" is a string or mark.
		 * Determines the call signature of the create function.
		 */
		type: TParentType
		/** Possible parent nodes that can have the given children. The children need not be direct descendants or real prosemirror nodes since `create` is what determines how they're created. */
		names: string[]
	}
} & (
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	{} | {
		skipChild?: (parentType: string, childType: string, depth: number) => boolean
		children: {
			/** The type of children (node or "text") where "text" is a string or mark. */
			type: TChildType
			/* Children types and their relative weights. */
			names: [name: string, weight: number][]
		}
		/**
		 * How many children to generate, is passed the depth so you can make the tree "slimmer" as it does deeper.
		 *
		 * See the `sometimesZero`, `influenceWithDepth` and `createRandomChildCountGenerator` helpers to make this easier to control.
		 */
		count: (depth: number) => number
	}
)

