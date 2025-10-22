import { faker } from "@faker-js/faker"
import { builders } from "prosemirror-test-builder"
import { describe, expect, it } from "vitest"

import { schema } from "../src/runtime/pm/schema.js"
import { generateRandomDoc } from "../src/runtime/pm/utils/generateRandomDoc.js"
import { generateRandomTree } from "../src/runtime/pm/utils/generateRandomTree.js"

describe("Generator", () => {
	it("generates a random doc and does not throw", () => {
		faker.seed(1)
		const pm = builders(schema)

		expect(() => {
			try {
				for (let i = 0; i < 20; i++) {
					const doc = generateRandomDoc(pm)
				}
			} catch (e) {
				// vitest doesn't show error stack
				// eslint-disable-next-line no-console
				console.error(e)
				throw e
			}
		}).to.not.throw()
	}, 10000)
})
