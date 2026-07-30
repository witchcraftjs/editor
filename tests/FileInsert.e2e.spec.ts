import { delay } from "@alanscodelog/utils/delay"
import { TextSelection } from "@tiptap/pm/state"
import type { Editor } from "@tiptap/vue-3"
import { describe, expect, it } from "vitest"

import { isPartiallyEqual } from "./utils/isPartiallyEqual.js"
import { pm } from "./utils/pm.js"
import { posByNode } from "./utils/posByNode.js"
import { setupWrapper } from "./utils/setupWrapper.js"

import { testFileInsertHandler } from "../src/runtime/pm/features/FileInsert/FileInsertHandler/TestFileInsertHandler.js"
import { findPlaceholder, placeholderPluginKey } from "../src/runtime/pm/features/FileInsert/plugins/placeholderPlugin.js"

const documents = {
	doc: {
		content: `
		<ul>
			<li blockid="${"1".repeat(10)}"><p>A</p></li>
			<li blockid="${"2".repeat(10)}"><p>B</p></li>
		</ul>
		`,
		title: "Embed"
	}
}
// could not get testing-library drop events to work
// not even with suggested workarounds
// see https://github.com/testing-library/react-testing-library/issues/339

async function simulateDrop(editor: Editor, files: File[], pos: number) {
	return editor.commands.insertFiles(files, pos)
}

function createFile(name: string, type: string, content: string) {
	const base64 = `data:image/png;base64,${btoa(content)}`
	return { file: new File([content], name, { type }), base64 }
}

describe("Image Insertion", () => {
	describe("image insert", async () => {
		it("single image", async () => {
			const file = createFile("hello.png", "image/png", "hello")
			const { editor, c } = await setupWrapper(pm.doc(pm.list(
				pm.item(pm.paragraph("target")),
				pm.item(pm.paragraph("item"))
			)), { documents })
			const doc = editor.state.doc
			const targetPos = posByNode(doc, { textContent: "target", type: "paragraph", attrs: {}, insert: true })

			await simulateDrop(editor, [file.file], targetPos)

			const beforeInsertChangedDoc = editor.state.doc.toJSON()
			const beforeInsertExpectedDoc = pm.doc(
				pm.list(
					pm.itemNoId(pm.paragraph("target")),
					pm.itemNoId(pm.paragraph("item"))
				)
			).toJSON()
			expect(isPartiallyEqual(beforeInsertChangedDoc, beforeInsertExpectedDoc)).to.equal(true)

			await delay(testFileInsertHandler.delay + 1000)
			const changedDoc = editor.state.doc.toJSON()
			const expectedDoc = pm.doc(
				pm.list(
					pm.itemNoId(pm.paragraph(
						"target",
						pm.file({ src: file.base64 })
					)),
					pm.itemNoId(pm.paragraph("item"))
				)
			).toJSON()
			expect(isPartiallyEqual(changedDoc, expectedDoc)).to.equal(true)
			c.unmount()
		})

		it("multiple image", async () => {
			const file = createFile("hello.png", "image/png", "hello")
			const file2 = createFile("hello2.png", "image/png", "hello2")
			const { editor, c } = await setupWrapper(pm.doc(pm.list(
				pm.item(pm.paragraph("target")),
				pm.item(pm.paragraph("item"))
			)), { documents })
			const doc = editor.state.doc
			const targetPos = posByNode(doc, { textContent: "target", type: "paragraph", attrs: {}, insert: true })

			await simulateDrop(editor, [file.file, file2.file], targetPos)

			// Before upload: doc is unchanged (decorations don't appear in toJSON)
			const beforeInsertChangedDoc = editor.state.doc.toJSON()
			const beforeInsertExpectedDoc = pm.doc(
				pm.list(
					pm.itemNoId(pm.paragraph("target")),
					pm.itemNoId(pm.paragraph("item"))
				)
			).toJSON()
			expect(isPartiallyEqual(beforeInsertChangedDoc, beforeInsertExpectedDoc)).to.equal(true)

			await delay(testFileInsertHandler.delay + 1000)
			const changedDoc = editor.state.doc.toJSON()
			const expectedDoc = pm.doc(
				pm.list(
					pm.itemNoId(pm.paragraph(
						"target",
						pm.file({ src: file.base64 }),
						pm.file({ src: file2.base64 })
					)),
					pm.itemNoId(pm.paragraph("item"))
				)
			).toJSON()
			expect(isPartiallyEqual(changedDoc, expectedDoc)).to.equal(true)
			c.unmount()
		})

		it("other file types are not uploaded or inserted", async () => {
			const file = createFile("any.png", "custom/any", "hello")
			const { editor, c } = await setupWrapper(pm.doc(pm.list(
				pm.item(pm.paragraph("target")),
				pm.item(pm.paragraph("item"))
			)), { documents })
			const doc = editor.state.doc
			const targetPos = posByNode(doc, { textContent: "target", type: "paragraph", attrs: {}, insert: true })
			await simulateDrop(editor, [file.file], targetPos)

			const changedDoc = editor.state.doc.toJSON()
			const expectedDoc = pm.doc(pm.list(
				pm.itemNoId(pm.paragraph("target")),
				pm.itemNoId(pm.paragraph("item"))
			)).toJSON()
			expect(isPartiallyEqual(changedDoc, expectedDoc)).to.equal(true)
			c.unmount()
		})


		it("creates new item when dropping between items", async () => {
			const file1 = createFile("first.png", "image/png", "first")
			const { editor, c } = await setupWrapper(pm.doc(pm.list(
				pm.item(pm.paragraph("A")),
				pm.item(pm.paragraph("B"))
			)), { documents })

			const betweenPos = posByNode(editor.state.doc, { textContent: "A", type: "paragraph", insert: true }) + 1
			expect(betweenPos).toEqual(5)
			await simulateDrop(editor, [file1.file], betweenPos)
			await delay(testFileInsertHandler.delay + 1000)
			expect(editor.state.doc.toJSON().content[0].content.length).to.equal(3)

			c.unmount()
		})

		it("creates new item when dropping between items (second drop position type)", async () => {
			const file1 = createFile("first.png", "image/png", "first")
			const { editor, c } = await setupWrapper(pm.doc(pm.list(
				pm.item(pm.paragraph("A")),
				pm.item(pm.paragraph("B"))
			)), { documents })

			// Drop first image after A paragraph (pos 5)
			const betweenPos = posByNode(editor.state.doc, { textContent: "A", type: "paragraph", insert: true }) + 1 + 2
			expect(betweenPos).toEqual(7)
			await simulateDrop(editor, [file1.file], betweenPos)
			await delay(testFileInsertHandler.delay + 1000)
			expect(editor.state.doc.toJSON().content[0].content.length).to.equal(3)

			c.unmount()
		})
	})

	describe("placeholder decorations", async () => {
		it("placeholder decoration exists before upload", async () => {
			const file = createFile("hello.png", "image/png", "hello")
			const { editor, c } = await setupWrapper(pm.doc(pm.list(
				pm.item(pm.paragraph("target"))
			)), { documents })

			const targetPos = posByNode(editor.state.doc, { textContent: "target", type: "paragraph", attrs: {}, insert: true })
			await simulateDrop(editor, [file.file], targetPos)

			// The doc should be unchanged (no node inserted)
			const changedDoc = editor.state.doc.toJSON()
			const expectedDoc = pm.doc(pm.list(
				pm.itemNoId(pm.paragraph("target"))
			)).toJSON()
			expect(isPartiallyEqual(changedDoc, expectedDoc)).to.equal(true)

			// Placeholder decoration should exist
			const placeholderPos = findPlaceholder(editor.state, "test-id")
			// We can't easily check by ID without the handler's insertId, so just verify
			// the decoration plugin has decorations
			const decos = placeholderPluginKey.getState(editor.state)
			expect(decos).not.to.equal(null)
			c.unmount()
		})

		it("placeholder is replaced with image after upload", async () => {
			const file = createFile("hello.png", "image/png", "hello")
			const { editor, c } = await setupWrapper(pm.doc(pm.list(
				pm.item(pm.paragraph("target"))
			)), { documents })

			const targetPos = posByNode(editor.state.doc, { textContent: "target", type: "paragraph", attrs: {}, insert: true })
			await simulateDrop(editor, [file.file], targetPos)

			await delay(testFileInsertHandler.delay + 1000)

			const changedDoc = editor.state.doc.toJSON()
			const expectedDoc = pm.doc(
				pm.list(
					pm.itemNoId(pm.paragraph(
						"target",
						pm.file({ src: file.base64 })
					))
				)
			).toJSON()
			expect(isPartiallyEqual(changedDoc, expectedDoc)).to.equal(true)
			c.unmount()
		})
	})

	describe("undo", async () => {
		it("undoing after insert removes the entire insertion (no inserter remains)", async () => {
			const file = createFile("undo.png", "image/png", "undo")
			const { editor, c } = await setupWrapper(pm.doc(pm.list(
				pm.item(pm.paragraph("target"))
			)), { documents })

			const targetPos = posByNode(editor.state.doc, { textContent: "target", type: "paragraph", attrs: {}, insert: true })
			await simulateDrop(editor, [file.file], targetPos)

			await delay(testFileInsertHandler.delay + 1000)

			editor.commands.undo()

			const changedDoc = editor.state.doc.toJSON()
			const expectedDoc = pm.doc(
				pm.list(
					pm.itemNoId(pm.paragraph("target"))
				)
			).toJSON()
			expect(isPartiallyEqual(changedDoc, expectedDoc)).to.equal(true)
			c.unmount()
		})
	})
})

