import { unreachable } from "@alanscodelog/utils/unreachable"
import { faker } from "@faker-js/faker"
import type { Mark, MarkType, Node } from "@tiptap/pm/model"
import type { builders } from "prosemirror-test-builder"

import { generateRandomTree } from "./generateRandomTree.js"

import type { GeneratorConfigEntry } from "../generator.js"
import { generatorConfig } from "../generator.js"

/**
 * Generates a random doc using faker js.
 *
 * A config describing how to create the doc is required. One is available under `pm/generator`.
 *
 * @experimental
 */
export function generateRandomDoc<
	TBuilder extends ReturnType<typeof builders>,
	TData extends string
>(
	builder: TBuilder,
	config: GeneratorConfigEntry<any, any, any, any>[] = generatorConfig,
	treeOptions?: Parameters<typeof generateRandomTree>[1],
	{
		checkAfterNodeCreation = false
	}: {
		/**
		 * Checks if every returned node is valid for debugging invalid generator configs.
		 *
		 * A check is always done on the root node at the end regardless of this option.
		 *
		 * It is very slow (each check, rechecks children).
		 *
		 * @default false
		 */
		checkAfterNodeCreation?: boolean
	} = {}
): Node {
	const schema = builder.schema

	const map: Record<string, GeneratorConfigEntry<any, any, any, any>> = {}
	function schemaFilter(name: string) {
		return name !== "text" && name !== schema.topNodeType.name
	}

	for (const entry of config) {
		for (const node of entry.parents.names) {
			if (node === "") throw new Error(`Empty node name ""`)
			const type = entry.parents.type === "node" ? schema.nodes[node] : schema.marks[node]
			if (type === undefined && node !== "text") {
				throw new Error(`${node} (on entry of type ${entry.parents.type}) not found in schema. Valid names are ${Object.keys(entry.parents.type === "node" ? schema.nodes : schema.marks)}`)
			}

			for (const node of entry.parents.names) {
				const subEntry = { ...entry }
				if (entry.ignoreValidation === undefined || entry.ignoreValidation !== true) {
					const childrenToValidate = (entry.children.names ?? []).filter(_ => !Array.isArray(entry.ignoreValidation) || !entry.ignoreValidation.includes(_))
					for (const child of childrenToValidate) {
						if (child === "") throw new Error(`Empty node name ""`)
						if (entry.children.type === "node") {
							const childType = schema.nodes[child]
							const possibleNames = [childType.name, ...((childType.spec.group ?? "").split(" ").filter(e => e !== ""))]
							const isAllowedChild = type.spec.content && possibleNames.some(n => type.spec.content!.includes(n))
							// we don't use contentMatch.matchType because
							// it can give false negatives when the content expression
							// has multiple types like type1+ type2+,
							// it will only return true for type1 in those cases
							if (!(isAllowedChild && schemaFilter(childType.name))) {
								throw new Error(`Node ${node} cannot contain child of type ${child}`)
							}
						} else {
							const childType = schema.marks[child]
							if (entry.parents.type === "node") {
								// not sure why this is returning false when it shouldn't (e.g. paragraph can't contain bold)
								// if (!(type as NodeType).allowsMarkType(childType)) {
								// 	throw new Error(`Node ${node} cannot contain mark child of type ${child}`)
								// }
							} else {
								const possibleNames = [childType.name, ...((childType.spec.group ?? "").split(" ").filter(e => e !== ""))]
								const t = type as MarkType
								const isExcluded = t.spec.excludes !== undefined
									&& possibleNames.some(n => {
										// _ this means exclude everything in prosemirror
										return t.spec.excludes!.includes(n)
											|| t.spec.excludes!.includes("_")
									})
								if (isExcluded) {
									throw new Error(`Mark ${node} cannot contain mark child of type ${child}`)
								}
							}
						}
					}
				}
				map[node] = { ...subEntry }
			}
		}
	}


	const children = generateRandomTree<Node | Mark | string, TData>({
		parentData: (data?: TData): TData => {
			if (data === "") return "" as TData
			if (!data) unreachable()
			if (!map[data] || !map[data].children.names || map[data].children.names.length === 0) {
				// we must prematurely end the branch as the node can contain no children
				return "" as TData
			} else {
				const picked = faker.helpers.arrayElement(map[data].children.names)
				return picked as TData
			}
		},
		createNode: (children, _isLeaf, data): Node | Mark | string | undefined => {
			if (data === "") return undefined
			if (!data) unreachable()
			const type = schema.nodes[data]
			// type allows no children or isn't configured to generate children
			if (!type) return undefined

			const parent = map[data]?.create?.(data, children as any)
				?? builder[data]({}, ...children as any)

			if (checkAfterNodeCreation) {
				;(parent as any)?.check?.()
			}

			return parent
		}
	}, {
		...treeOptions,
		initialData: schema.topNodeType.name as TData
	})

	const doc = map[schema.topNodeType.name]?.create?.(schema.topNodeType.name as any, children as any)
		?? builder[schema.topNodeType.name]({}, ...children as any)

	;(doc as any).check?.()
	return doc as Node
}

