import { delay } from "@alanscodelog/utils/delay"
import type { Node } from "@tiptap/pm/model"
import type { Editor } from "@tiptap/vue-3"
import { describe, expect, it } from "vitest"

import { isPartiallyEqual } from "./utils/isPartiallyEqual.js"
import { pm } from "./utils/pm.js"
import { posByNode } from "./utils/posByNode.js"
import { setupWrapper } from "./utils/setupWrapper.js"

import { testFileLoaderDelay } from "../src/runtime/pm/features/FileLoader/FileLoaderHandler/TestFileLoaderHandler.js"

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
	return editor.commands.insertFile(files, pos)
}

function createFile(name: string, type: string, content: string) {
	const base64 = `data:image/png;base64,${btoa(content)}`
	return { file: new File([content], name, { type }), base64 }
}

describe("Image Insertion", () => {
	describe("image insert", async () => {
		async function drop(
			files: File[],
			target: Node,
			loadingExpected: Node[],
			expected: Node[]
		) {
			const { editor, c } = await setupWrapper(pm.doc(pm.list(
				pm.item(target),
				pm.item(pm.paragraph("item"))
			)), { documents })
			const doc = editor.state.doc
			const targetPos = posByNode(doc, { textContent: target.textContent, type: target.type.name, attrs: target.attrs })

			await simulateDrop(editor, files, targetPos)

			const beforeLoadChangedDoc = editor.state.doc.toJSON()
			const beforeLoadExpectedDoc = pm.doc(
				pm.list(
					pm.itemNoId(target),
					...loadingExpected,
					pm.itemNoId(pm.paragraph("item"))
				)
			).toJSON()
			expect(isPartiallyEqual(beforeLoadChangedDoc, beforeLoadExpectedDoc)).to.equal(true)

			// wait a lil bit, the test handler has a small delay
			await delay(testFileLoaderDelay + 1000)
			const changedDoc = editor.state.doc.toJSON()
			const expectedDoc = pm.doc(
				pm.list(
					pm.itemNoId(target),
					...expected,
					pm.itemNoId(pm.paragraph("item"))
				)
			).toJSON()
			expect(isPartiallyEqual(changedDoc, expectedDoc)).to.equal(true)
			c.unmount()
		}
		it("single image", async () => {
			const file = createFile("hello.png", "image/png", "hello")
			await drop(
				[
					file.file
				],
				pm.paragraph("target"),
				[
					pm.itemNoId(pm.fileLoader({ fileName: file.file.name, loading: true }))
				],
				[
					pm.itemNoId(pm.image({ src: file.base64 }))
				]
			)
		})
		it("multiple image", async () => {
			const file = createFile("hello.png", "image/png", "hello")
			const file2 = createFile("hello2.png", "image/png", "hello2")
			await drop(
				[
					file.file,
					file2.file
				],
				pm.paragraph("target"),
				[
					pm.itemNoId(pm.fileLoader({ fileName: file.file.name, loading: true })),
					pm.itemNoId(pm.fileLoader({ fileName: file2.file.name, loading: true }))
				],
				[
					pm.itemNoId(pm.image({ src: file.base64 })),
					pm.itemNoId(pm.image({ src: file2.base64 }))
				]
			)
		})
		it("any file type is not loaded or inserted", async () => {
			const file = createFile("any.png", "custom/any", "hello")
			await drop(
				[file.file],
				pm.paragraph("target"),
				[],
				[]
			)
		})
	})
	describe("auto-deletion of fileLoader nodes on load", async () => {
		it("single image (last/alone)  => loader turns into paragraph", async () => {
			const { editor } = await setupWrapper(pm.doc(pm.list(
				pm.item(pm.fileLoader({ fileName: "hello.png", loading: true }))
			)), { documents })

			const changedDoc = editor.state.doc.toJSON()
			const expectedDoc = pm.doc(pm.list(
				pm.itemNoId(pm.paragraph(""))
			)).toJSON()
			expect(isPartiallyEqual(changedDoc, expectedDoc)).to.equal(true)
		})
		it("single image (not alone) => parent item gets deleted", async () => {
			const { editor } = await setupWrapper(pm.doc(pm.list(
				pm.item(pm.paragraph("item")),
				pm.item(pm.fileLoader({ loadingId: "0000000000", fileName: "hello.png", loading: true }))
			)), { documents })

			const changedDoc = editor.state.doc.toJSON()
			const expectedDoc = pm.doc(
				pm.list(
					pm.itemNoId(pm.paragraph("item"))
				)
			).toJSON()
			expect(isPartiallyEqual(changedDoc, expectedDoc)).to.equal(true)
		})
		it("single image (with children) => loader turns into paragraph", async () => {
			const { editor } = await setupWrapper(pm.doc(pm.list(
				pm.item(pm.fileLoader({ loadingId: "0000000000", loading: true }),
					pm.list(
						pm.item(pm.paragraph("item"))
					)
				)
			)), { documents })

			const changedDoc = editor.state.doc.toJSON()
			const expectedDoc = pm.doc(pm.list(
				pm.itemNoId(pm.paragraph(""),
					pm.list(
						pm.itemNoId(pm.paragraph("item"))
					)
				))).toJSON()
			expect(isPartiallyEqual(changedDoc, expectedDoc)).to.equal(true)
		})
		it("multiple nested loaders => all deleted except root which turns into a paragraph", async () => {
			const { editor } = await setupWrapper(pm.doc(pm.list(
				pm.item(pm.fileLoader({ loadingId: "0000000000" }),
					pm.list(
						pm.item(pm.fileLoader({ loadingId: "0000000000" }),
							pm.list(
								pm.item(pm.fileLoader({ loadingId: "0000000000" }))
							)
						)
					)
				)
			)), { documents })

			const changedDoc = editor.state.doc.toJSON()
			const expectedDoc = pm.doc(pm.list(
				pm.itemNoId(pm.paragraph(""))
			)).toJSON()
			expect(isPartiallyEqual(changedDoc, expectedDoc)).to.equal(true)
		})
		it("nested loader with sibling item => only nested loader is deleted, not the wrapping list", async () => {
			const { editor } = await setupWrapper(pm.doc(pm.list(
				pm.item(pm.paragraph("item")),
				pm.list(
					pm.item(pm.fileLoader({ loadingId: "0000000000" }),
						pm.item(pm.paragraph("item"))
					)
				)
			)), { documents })

			const changedDoc = editor.state.doc.toJSON()
			const expectedDoc = pm.doc(pm.list(
				pm.itemNoId(pm.paragraph(""),
					pm.list(
						pm.itemNoId(pm.paragraph("item"))
					)
				)
			)).toJSON()
			expect(isPartiallyEqual(changedDoc, expectedDoc)).to.equal(true)
		})
	})
})
