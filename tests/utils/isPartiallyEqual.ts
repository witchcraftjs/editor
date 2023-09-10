/* eslint-disable no-console */
import { keys } from "@alanscodelog/utils/keys"
/**
	* Returns true if a contains the same nested structure and values defined by b.
	*
	* Exists because I can't seem to get expect.containsObject to work right, even nesting it and using containsArray... Also has become useful for other things.
	*/
export function isPartiallyEqual(
	a: any,
	b: any,
	opts: {
		ignoreUndefined?: boolean
		ignoredKeys?: string[]
		log?: boolean
		autoAddLastParagraph?: boolean
	} = {}
): boolean {
	opts = { log: true, ignoreUndefined: true, autoAddLastParagraph: true, ...opts }
	if (opts.ignoreUndefined && b === undefined) return true
	if (typeof a !== typeof b) {
		if (opts.log) console.log("types unequal", typeof a, typeof b)
		return false
	}
	if (typeof b === "object" && b !== null && !Array.isArray(b)) {
		for (const key of keys(a)) {
			if (opts.ignoredKeys?.includes(key as any)) continue
			if (!isPartiallyEqual(a[key], b[key], opts)) {
				if (opts.log) console.log("unequal at key", key)
				return false
			}
		}
		return true
	} else if (Array.isArray(b)) {
		if (a.length !== b.length) {
			if (opts.log) console.log("lengths unequal")
			return false
		}
		for (let i = 0; i < b.length; i++) {
			if (!isPartiallyEqual(a[i], b[i], opts)) {
				if (opts.log) console.log("unequal at index", i)
				return false
			}
		}
		return true
	} else {
		if (a !== b) {
			if (opts.log) console.log("unequal", a, b)
		}
		return a === b
	}
}
