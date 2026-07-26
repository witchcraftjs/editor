import { describe, expect, it } from "vitest"

import { isPartiallyEqual } from "./utils/isPartiallyEqual.js"
import { pm } from "./utils/pm.js"
import { posByNode } from "./utils/posByNode.js"
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

	it("[embed] [embed] [par] [cursor: backspace] should delete the second embedded item", async () => {
		const documents = {
			docA: {
				content: `<p>EMBED A</p>`,
				title: "Doc A"
			},
			docB: {
				content: `<p>EMBED B</p>`,
				title: "Doc B"
			}
		}

		const { editor, c } = await setupWrapper(
			pm.doc(
				pm.list(
					pm.item(pm.embeddedDoc({ embedId: { docId: "docA" } })),
					pm.item(pm.embeddedDoc({ embedId: { docId: "docB" } })),
					pm.item(pm.paragraph("FIRST PARAGRAPH"))
				)
			),
			{ documents })

		const paragraphPos = posByNode(editor.state.doc, { type: "paragraph", textContent: "FIRST PARAGRAPH" })
		editor.commands.setTextSelection(paragraphPos + 1)
		editor.commands.backspace()

		const changedDoc = editor.state.doc.toJSON()
		const expectedDoc = pm.doc(
			pm.list(
				pm.itemNoId(pm.embeddedDoc({ embedId: { docId: "docA" } })),
				pm.itemNoId(pm.paragraph("FIRST PARAGRAPH"))
			)
		).toJSON()
		expect(isPartiallyEqual(changedDoc, expectedDoc)).to.equal(true)

		c.unmount()
	})

	it("[par] [embed] [embed] [par] [cursor: backspace] should delete the second embedded item", async () => {
		const documents = {
			docA: {
				content: `<p>EMBED A</p>`,
				title: "Doc A"
			},
			docB: {
				content: `<p>EMBED B</p>`,
				title: "Doc B"
			}
		}

		const { editor, c } = await setupWrapper(
			pm.doc(
				pm.list(
					pm.item(pm.paragraph("FIRST PARAGRAPH")),
					pm.item(pm.embeddedDoc({ embedId: { docId: "docA" } })),
					pm.item(pm.embeddedDoc({ embedId: { docId: "docB" } })),
					pm.item(pm.paragraph())
				)
			),
			{ documents })

		// Find the empty paragraph (last item)
		const emptyParagraphPos = posByNode(editor.state.doc, { type: "paragraph", textContent: "" })
		editor.commands.setTextSelection(emptyParagraphPos + 1)
		editor.commands.backspace()

		const changedDoc = editor.state.doc.toJSON()
		const expectedDoc = pm.doc(
			pm.list(
				pm.itemNoId(pm.paragraph("FIRST PARAGRAPH")),
				pm.itemNoId(pm.embeddedDoc({ embedId: { docId: "docA" } })),
				pm.itemNoId(pm.paragraph())
			)
		).toJSON()
		expect(isPartiallyEqual(changedDoc, expectedDoc)).to.equal(true)

		c.unmount()
	})
})
