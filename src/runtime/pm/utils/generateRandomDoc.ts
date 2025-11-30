import { faker } from "@faker-js/faker"
import type { Node } from "@tiptap/pm/model"
import type { builders } from "prosemirror-test-builder"

import type { GeneratorConfigEntry } from "./generator/createGeneratorConfig.js"

import { generatorConfig } from "../generator.js"

export function generateRandomDoc<
	TBuilder extends ReturnType<typeof builders>
>(
	pm: TBuilder,
	config: GeneratorConfigEntry<any, any, any, any>[] = generatorConfig
) {
	function generateNode(
		pm: TBuilder,
		nodeConfig: GeneratorConfigEntry<TBuilder, any, any, any, any>,
		parentType: string,
		depth = 0
	): Node {
		if (!nodeConfig.parents.names.includes(parentType)) {
			throw new Error(`Node config ${nodeConfig.parents.names.join(", ")} does not include parent type ${parentType}`)
		}
		const nodes = []
		if ("count" in nodeConfig) {
			const childrenCount = nodeConfig.count(depth)
			for (let i = 0; i < childrenCount; i++) {
				const type = pickWeightedChild(nodeConfig.children.names)
				if (type === undefined) continue
				if (nodeConfig?.skipChild?.(parentType, type, depth)) continue
				const childConfig = config.find(c => {
					return c.parents.names.includes(type)
				})
				if (!childConfig) continue
				const child = generateNode(pm, childConfig, type, depth + 1)
				if (child === undefined) continue
				nodes.push(child)
			}
		}
		return nodeConfig.create(pm, parentType, nodes)
	}
	const firstEntry = config[0]
	if (firstEntry === undefined) throw new Error("No config entries found.")
	if (!("children" in firstEntry)) throw new Error("No children found in the first config entry. The first entry must have children.")
	const startingType = pickWeightedChild(firstEntry.parents.names.map(name => [name, 1]))
	if (startingType === undefined) throw new Error("No starting type found.")
	return generateNode(pm, config[0], startingType)
}


export function pickWeightedChild(options: [string, number][]): string | undefined {
	const totalWeight = options.reduce((sum, [, weight]) => sum + weight, 0)
	if (totalWeight === 0) return undefined

	let random = faker.number.float({ min: 0, max: totalWeight })
	for (const [name, weight] of options) {
		if (random < weight) return name
		random -= weight
	}
	// Fallback to first if rounding errors occur
	return options[0][0]
}

