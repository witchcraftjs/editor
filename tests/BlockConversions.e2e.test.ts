import type { Node } from "@tiptap/pm/model"
import { TextSelection } from "@tiptap/pm/state"
import { describe, expect, it } from "vitest"

import { isPartiallyEqual } from "./utils/isPartiallyEqual.js"
import { pm } from "./utils/pm.js"
import { posByNode } from "./utils/posByNode.js"
import { setupWrapper } from "./utils/setupWrapper.js"

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

// for each pair, convertFrom, should turn into all the other convertTos
// some nodes are capable of keeping some marks, others are not
const aMark = pm.italic("A")
const bMark = pm.bold("B")
const cMark = pm.code("C")
const aMarkless = "A"
const bMarkless = "B"
const cMarkless = "C"
const fromToNodePairs: Record<string, [convertFrom: Node, convertTo: Node, convertToFromMarkless: Node]> = {
	table: [
		pm.table(
			pm.tableRow(
				pm.tableHeader(),
				pm.tableHeader(),
				pm.tableHeader()
			),
			pm.tableRow(
				pm.tableHeader(pm.paragraph(aMark)),
				pm.tableHeader(pm.paragraph(bMark)),
				pm.tableHeader(pm.paragraph(cMark))
			)
		),
		pm.table(
			pm.tableRow(
				pm.tableCell(
					pm.paragraph(aMark, bMark, cMark)
				)
			)
		),
		pm.table(
			pm.tableRow(
				pm.tableCell(
					pm.paragraph(aMarkless + bMarkless + cMarkless)
				)
			)
		)
	],
	paragraph: [
		pm.paragraph(aMark, bMark, cMark),
		pm.paragraph(aMark, bMark, cMark),
		pm.paragraph(aMarkless + bMarkless + cMarkless)
	],
	codeBlock: [
		pm.codeBlock({ language: "js", loading: true }, aMarkless + bMarkless + cMarkless),
		pm.codeBlock({ language: "", loading: true }, aMarkless + bMarkless + cMarkless),
		pm.codeBlock({ language: "", loading: true }, aMarkless + bMarkless + cMarkless)
	],
	embeddedDoc: [
		pm.embeddedDoc({ embedId: { docId: "doc", blockId: "1".repeat(10) } }),
		pm.embeddedDoc({ embedId: { docId: undefined, blockId: undefined } }),
		pm.embeddedDoc({ embedId: { docId: undefined, blockId: undefined } })
	],
	...Object.fromEntries([
		"heading1",
		"heading2",
		"heading3",
		"heading4",
		"heading5",
		"heading6"
	].map((name, i) => [
		name,
		[
			pm.heading({ level: i + 1 }, aMark, bMark, cMark),
			pm.heading({ level: i + 1 }, aMark, bMark, cMark),
			pm.heading({ level: i + 1 }, aMarkless + bMarkless + cMarkless)
		]
	]))
}
describe("Block Conversions", () => {
	async function convert(
		convertFrom: Node,
		convertTo: Node,
		{
			keepsFullSelection = true,
			keepsContent = true
		}: {
			keepsFullSelection?: boolean
			keepsContent?: boolean
		} = {}
	) {
		const item = pm.item(convertFrom)
		const { editor, c } = await setupWrapper(pm.doc(pm.list(
			item
		)), { documents })
		const doc = editor.state.doc
		const targetPos = posByNode(doc, item)
		if (keepsFullSelection) {
			editor.commands.setTextSelection(
				TextSelection.create(doc,
					TextSelection.near(doc.resolve(0), 1)!.from,
					TextSelection.near(doc.resolve(doc.content.size), -1)!.to
				)
			)
			expect(editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)).to.equal("ABC")
		} else {
			// for nodes that don't support keeping full selections (e.g. tables) we place the selection at the end of the document to check the offset mapping is working correctly
			editor.commands.setTextSelection(
				TextSelection.create(doc,
					TextSelection.near(doc.resolve(doc.content.size), -1)!.to
				)
			)
		}

		editor.commands.setNode(convertTo.type.name, undefined, targetPos + 1)

		const changedDoc = editor.state.doc.toJSON()
		const expectedDoc = pm.doc(
			pm.list(
				pm.item(convertTo)
			)
		).toJSON()
		expect(isPartiallyEqual(changedDoc, expectedDoc)).to.equal(true)

		if (keepsContent) {
			if (keepsFullSelection) {
				expect(editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)).to.equal("ABC")
			} else {
				expect(editor.state.selection.from).to.equal(TextSelection.near(editor.state.doc.resolve(editor.state.doc.content.size), 1)!.from)
			}
		}
	}
	describe("converts from table", async () => {
		it("to p", async () => {
			await convert(fromToNodePairs.table[0], fromToNodePairs.paragraph[1], { keepsFullSelection: false })
		})
		it("to codeBlock", async () => {
			await convert(fromToNodePairs.table[0], fromToNodePairs.codeBlock[1], { keepsFullSelection: false })
		})
		it("to embeddedDoc", async () => {
			await convert(fromToNodePairs.table[0], fromToNodePairs.embeddedDoc[1], { keepsContent: false, keepsFullSelection: false })
		})
		it("to heading", async () => {
			await convert(fromToNodePairs.table[0], fromToNodePairs.heading1[1], { keepsFullSelection: false })
		})
	})
	describe("converts from paragraph", async () => {
		it("to table", async () => {
			await convert(fromToNodePairs.paragraph[0], fromToNodePairs.table[1])
		})
		it("to codeBlock", async () => {
			await convert(fromToNodePairs.paragraph[0], fromToNodePairs.codeBlock[1])
		})
		it("to embeddedDoc", async () => {
			await convert(fromToNodePairs.paragraph[0], fromToNodePairs.embeddedDoc[1], { keepsContent: false })
		})
		it("to heading", async () => {
			await convert(fromToNodePairs.paragraph[0], fromToNodePairs.heading1[1])
		})
	})
	describe("converts from codeBlock", async () => {
		it("to table", async () => {
			await convert(fromToNodePairs.codeBlock[0], fromToNodePairs.table[2])
		})
		it("to paragraph", async () => {
			await convert(fromToNodePairs.codeBlock[0], fromToNodePairs.paragraph[2])
		})
		it("to embeddedDoc", async () => {
			await convert(fromToNodePairs.codeBlock[0], fromToNodePairs.embeddedDoc[2], { keepsContent: false })
		})
		it("to heading", async () => {
			await convert(fromToNodePairs.codeBlock[0], fromToNodePairs.heading1[2])
		})
	})
	describe("converts from embeddedDoc", async () => {
		it("to table", async () => {
			await convert(fromToNodePairs.embeddedDoc[0], fromToNodePairs.table[1], { keepsContent: false, keepsFullSelection: false })
		})
		it("to paragraph", async () => {
			await convert(fromToNodePairs.embeddedDoc[0], fromToNodePairs.paragraph[1], { keepsContent: false, keepsFullSelection: false })
		})
		it("to codeBlock", async () => {
			await convert(fromToNodePairs.embeddedDoc[0], fromToNodePairs.codeBlock[1], { keepsContent: false, keepsFullSelection: false })
		})
		it("to heading", async () => {
			await convert(fromToNodePairs.embeddedDoc[0], fromToNodePairs.heading1[1], { keepsContent: false, keepsFullSelection: false })
		})
	})
	describe("converts from heading", async () => {
		it("to table", async () => {
			await convert(fromToNodePairs.heading1[0], fromToNodePairs.table[1])
		})
		it("to paragraph", async () => {
			await convert(fromToNodePairs.heading1[0], fromToNodePairs.paragraph[1])
		})
		it("to codeBlock", async () => {
			await convert(fromToNodePairs.heading1[0], fromToNodePairs.codeBlock[1])
		})
		it("to embeddedDoc", async () => {
			await convert(fromToNodePairs.heading1[0], fromToNodePairs.embeddedDoc[1], { keepsContent: false })
		})
	})
})
