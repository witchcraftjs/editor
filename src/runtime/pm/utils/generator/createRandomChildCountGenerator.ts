import { faker } from "@faker-js/faker"

import { influenceWithDepth } from "./influenceWithDepth.js"
import { sometimesZero } from "./sometimesZero.js"

/**
 * Combines `sometimesZero` and `influenceWithDepth` to create a function that returns a random number to pass to `count`.
 *
 * ```ts
 * count: createRandomChildCountGenerator({ max: 10, depthInfluence: 0.5 })
 * // or
 * count: (depth: number) => createRandomChildCountGenerator({ max: 10, depthInfluence: 0.5 })(depth)
 * ```
 */
export function createRandomChildCountGenerator({
	max = 10,
	zeroChance = 0.05,
	depthInfluence = 1
}: {
	max: number
	zeroChance?: number
	depthInfluence?: number
}) {
	return (depth: number) => {
		depth++
		return sometimesZero(
			faker.number.int({ min: 1, max: influenceWithDepth(max, depth, depthInfluence) || 1 }),
			zeroChance
		)
	}
}
