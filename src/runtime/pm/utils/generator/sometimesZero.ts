import { faker } from "@faker-js/faker"

/**
 * Returns 0 instead of the given number depending on the chance passed (0.05 by default).
 *
 * This is useful to avoid too many empty nodes without having to increase the max a lot.
 *
 * You can pass chance 0 to always return the given number.
 */

export function sometimesZero(num: number, chance: number = 0.05, getRandom = faker.number.float) {
	if (getRandom() < chance) {
		return 0
	}
	return num
}
