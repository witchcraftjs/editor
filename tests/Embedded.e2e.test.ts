import { delay } from "@alanscodelog/utils/delay"
import { describe, expect, it } from "vitest"

import { getEmbeddedEditors } from "./utils/getEmbeddedEditors.js"
import { isPartiallyEqual } from "./utils/isPartiallyEqual.js"
import { pm } from "./utils/pm.js"
import { posByNode } from "./utils/posByNode.js"
import { setupWrapper } from "./utils/setupWrapper.js"

describe("Document Embeds", () => {
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

describe("Document Embeds Undo", () => {
	it("two embeds of the same doc share one state and one undo history", async () => {
		const documents = {
			target: {
				content: `<p>SHARED BLOCK</p>`,
				title: "Target"
			}
		}

		const { c, editor } = await setupWrapper(
			pm.doc(
				pm.list(
					pm.item(pm.embeddedDoc({ embedId: { docId: "target" } })),
					pm.item(pm.embeddedDoc({ embedId: { docId: "target" } }))
				)
			),
			{ documents, useCollab: true }
		)
		try {
			await delay(200)

			const [embedA, embedB] = getEmbeddedEditors(editor, "target")
			expect(embedA).toBeDefined()
			expect(embedB).toBeDefined()

			const untyped = pm.list(pm.itemNoId(pm.paragraph("SHARED BLOCK"))).toJSON()
			const typed = pm.list(pm.itemNoId(pm.paragraph("SHARED BLOCK TYPED"))).toJSON()

			// type in the first embed, both should show it
			let textEnd = 0
			embedA.state.doc.nodesBetween(0, embedA.state.doc.content.size, (node, pos) => {
				if (node.isText) textEnd = pos + node.nodeSize
			})
			embedA.commands.insertContentAt(textEnd, " TYPED")
			await delay(300)
			expect(isPartiallyEqual(embedB.state.doc.toJSON(), { content: [typed] })).toBe(true)

			// undo from the second embed reverts both
			const undid = embedB.commands.undo()
			await delay(300)
			expect(undid).toBe(true)
			expect(isPartiallyEqual(embedA.state.doc.toJSON(), { content: [untyped] })).toBe(true)
			expect(isPartiallyEqual(embedB.state.doc.toJSON(), { content: [untyped] })).toBe(true)
		} finally {
			c.unmount()
		}
	})

	const WARNING_TEXT = "Warning: Undo applied to document part that is not visible/embedded."

	/**
	 * A parent document holds two embeds to the same child document.
	 * The child has two item blocks, A and B.
	 * Embed #1 points at the whole child doc (A + B).
	 * Embed #2 points at only block A.
	 *
	 * Typing in B (via embed #1) then undoing from embed #2 (which only shows A)
	 * should flash the "undo outside range" warning on embed #2, because the
	 * reverted change (B) is outside A's block range.
	 */
	async function setupUndoWarning(useCollab: boolean) {
		const documents = {
			child: {
				content: pm.doc(
					pm.list(
						pm.item(pm.paragraph("A")),
						pm.item(pm.paragraph("B"))
					)
				).toJSON(),
				title: "Child"
			}
		}

		const root = pm.doc(
			pm.list(
				// embed #1: whole child doc (A + B)
				pm.item(pm.embeddedDoc({ embedId: { docId: "child" } })),
				// embed #2: only block A - filled in after load once we know A's blockId
				pm.item(pm.embeddedDoc({ embedId: { docId: "child", blockId: "PENDING_A" } }))
			)
		)

		const wrapper = await setupWrapper(root, { documents, useCollab })
		await delay(300)

		const editors = getEmbeddedEditors(wrapper.editor, "child")
		expect(editors.length).toBe(2)

		// read A's real blockId from the whole-doc embed's inner state
		const wholeEmbed = editors[0]
		let blockA: string | undefined
		wholeEmbed.state.doc.descendants((node, _pos) => {
			if (node.type.name === "item" && node.attrs.blockId && !blockA) {
				blockA = node.attrs.blockId as string
				return false
			}
			return true
		})
		expect(blockA).toBeDefined()

		// point embed #2 at the real block A
		let embedAPos = -1 // eslint-disable-line @typescript-eslint/naming-convention
		wrapper.editor.state.doc.descendants((node, pos) => {
			if (node.type.name === "embeddedDoc" && node.attrs.embedId?.blockId === "PENDING_A") {
				embedAPos = pos
				return false
			}
			return true
		})
		wrapper.editor.view.dispatch(
			wrapper.editor.state.tr.setNodeMarkup(embedAPos, undefined, {
				embedId: { docId: "child", blockId: blockA }
			})
		)
		await delay(300)

		return { wrapper, wholeEmbed, blockA }
	}

	it("non-collab: undo in a block-scoped embed flashes the warning when the change was outside its range", async () => {
		const { wrapper, wholeEmbed } = await setupUndoWarning(false)
		try {
			// type in B via the whole-doc embed
			let bTextEnd = 0
			wholeEmbed.state.doc.nodesBetween(0, wholeEmbed.state.doc.content.size, (node, pos) => {
				if (node.isText && node.text === "B") bTextEnd = pos + node.nodeSize
			})
			expect(bTextEnd).toBeGreaterThan(0)
			wholeEmbed.commands.insertContentAt(bTextEnd, "BB")
			await delay(300)

			// undo from the block-A-only embed (the second embed, in document order)
			const [, embedA] = getEmbeddedEditors(wrapper.editor, "child")
			expect(embedA).toBeDefined()
			const undid = embedA!.commands.undo()
			await delay(100)

			// the warning should be visible in embed A's nodeview
			const html = wrapper.c.container.innerHTML
			expect(html).toContain(WARNING_TEXT)
		} finally {
			wrapper.c.unmount()
		}
	})

	it("collab: undo in a block-scoped embed flashes the warning when the change was outside its range", async () => {
		const { wrapper, wholeEmbed } = await setupUndoWarning(true)
		try {
			let bTextEnd = 0
			wholeEmbed.state.doc.nodesBetween(0, wholeEmbed.state.doc.content.size, (node, pos) => {
				if (node.isText && node.text === "B") bTextEnd = pos + node.nodeSize
			})
			expect(bTextEnd).toBeGreaterThan(0)
			wholeEmbed.commands.insertContentAt(bTextEnd, "BB")
			await delay(300)

			const [, embedA] = getEmbeddedEditors(wrapper.editor, "child")
			expect(embedA).toBeDefined()
			const undid = embedA!.commands.undo()
			await delay(100)

			const html = wrapper.c.container.innerHTML
			expect(html).toContain(WARNING_TEXT)
		} finally {
			wrapper.c.unmount()
		}
	})
})
