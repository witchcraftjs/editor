import { describe, expect, it } from "vitest"

import { pm } from "./utils/pm.js"
import { setupWrapper } from "./utils/setupWrapper.js"

describe("Embedded Documents", () => {
	it("renders embedded blocks correctly", async () => {
		const documents = {
			doc: {
				content: `<p>THIS IS EMBEDDED CONTENT</p>`,
				title: "Embed"
			}
		}

		const { c } = await setupWrapper(
			pm.doc(
				pm.list(
					pm.item(
						pm.embeddedDoc({ embedId: { docId: "doc" } })
					)
				)
			),
			{ documents })

		const html = c.container.innerHTML
		expect(html).toContain("THIS IS EMBEDDED CONTENT")

		c.unmount()
	})
})
