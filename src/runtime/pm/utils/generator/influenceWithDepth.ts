/**
 * Decreases the given number by dividing it by the depth + 1 (so it it's not zero). Returns a floored *int*.
 *
 * Intended to help decrease the number of nodes as the depth increases. Can be adjusted by the strength parameter, to, for example, decrease the adjustment for nodes that tend to be deeper.
 */
export function influenceWithDepth(num: number, depth: number, strength: number = 1) {
	if (num === 0) return 0
	depth++ // don't allow it to be 0
	const adjusted = Math.floor(num / (depth * strength))
	return adjusted
}
