import { faker } from "@faker-js/faker"
/**
 * Generates a random tree structure where the probability of generating children
 * decreases linearly with depth, resulting in a tree that is bushy at the top
 * and sparse towards the maximum depth.
 *
 * This function is agnostic to the actual node structure, relying on the caller-provided
 * callbacks to create and link nodes.
 *
 * It uses faker.js for randomness (even on the option parameters).
 *
 * See {@link generateRandomDoc} for an example of how to use it.
 *
 * @experimental
 */
export function generateRandomTree<T, TData>(
	{
		createNode,
		parentData
	}: {
		/** A function that creates a new node (type T) given its depth. */
		createNode: (children: T[], isLeaf: boolean, parentData?: TData) => T | undefined
		/**
		 * A function that is called before creating a a node or it's children whose result is passed to both. This allows creating children that will be compatible with the parent (via this same function, it is passed it's parent).
		 *
		 * For example, we could randomly generate a parent type. It's then passed both to the children, to limit the types of children nodes, and to the parent so it can actually create it.
		 */
		parentData?: (parentData?: TData) => TData
	},
	{
		rootNodes: rootNodes = faker.number.int({ min: 0, max: 5 }),
		depth = faker.number.int({ min: 0, max: 5 }),
		minChildren = 0,
		maxInitialChildren = 10,
		initialData
	}: {
		/**
		 * The exact number of nodes at depth 0.
		 *
		 * @default faker.number.int({ min: 0, max: 5 })
		 */
		rootNodes?: number
		/**
		 * The maximum depth of the tree (0-indexed). Nodes at this depth will have 0 children.
		 *
		 * @default faker.number.int({ min: 0, max: 5 })
		 */
		depth?: number
		/**
		 * The absolute minimum number of children any node can have.
		 *
		 * @default 0
		 */
		minChildren?: number
		/**
		 * The maximum children a node can have at depth 0. This value scales down as depth increases.
		 *
		 * @default 10
		 */
		maxInitialChildren?: number
		initialData?: TData
	} = {}
): T[] {
	const generateChildren = (currentDepth: number, childCount: number, pData?: TData): T[] => {
		const res: T[] = []
		for (let i = 0; i < childCount; i++) {
			const numChildren = calculateNumChildren(depth, currentDepth, minChildren, maxInitialChildren)

			const data = parentData?.(pData) ?? undefined
			const parent = createNode(
				generateChildren(currentDepth + 1, numChildren, data),
				numChildren === 0,
				data
			)
			if (parent === undefined) continue
			res.push(parent)
		}
		return res
	}

	return generateChildren(0, rootNodes, initialData)
}

function calculateNumChildren(
	depth: number,
	currentDepth: number,
	minChildren: number,
	maxInitialChildren: number
): number {
	const decayFactor = depth > 0 ? (depth - currentDepth) / depth : 0
	const maxAtDepth = minChildren + (maxInitialChildren - minChildren) * decayFactor
	const maxChildrenAtDepth = Math.max(minChildren, Math.floor(maxAtDepth))

	let numChildren = 0

	if (currentDepth < depth) {
		numChildren = faker.number.int({ min: minChildren, max: maxChildrenAtDepth })
	}
	return numChildren
}
