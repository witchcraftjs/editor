import { EditorState, TextSelection } from "@tiptap/pm/state"
import { describe, expect, it } from "vitest"

import { pm } from "./utils/pm.js"
import { posByNode } from "./utils/posByNode.js"

import { fixBlockIds } from "../src/runtime/pm/features/Blocks/utils/fixBlockIds.js"
import { isValidId } from "../src/runtime/pm/features/Blocks/utils/isValidId.js"
import { testSchema } from "../src/runtime/pm/testSchema.js"
import { getMarkPosition } from "../src/runtime/pm/utils/getMarkPosition.js"
import { getMarksInSelection } from "../src/runtime/pm/utils/getMarksInSelection.js"

describe("fixBlockIds", () => {
	it("replaces invalid blockIds", () => {
		const state = EditorState.create({
			doc: pm.doc(pm.list(
				pm.item({ blockId: "invalid" }, pm.paragraph())
			))
		})
		const tr = state.tr
		fixBlockIds(tr, testSchema.nodes.item, 10)
		expect(isValidId(state.doc.child(0).child(0).attrs.blockId, 10)).to.equal(false)
		expect(isValidId(tr.doc.child(0).child(0).attrs.blockId, 10)).to.equal(true)
	})

	it("adds missing blockIds without the need of fixBlockIds", () => {
		const state = EditorState.create({
			doc: pm.doc(pm.list(
				pm.item({ blockId: undefined }, pm.paragraph())
			))
		})
		expect(isValidId(state.doc.child(0).child(0).attrs.blockId, 10)).to.equal(true)
	})
	it("replaces duplicate blockIds", () => {
		const duplicateId = "0".repeat(10)
		const content = pm.doc(pm.list(
			pm.item({ blockId: duplicateId }, pm.paragraph()),
			pm.item({ blockId: duplicateId }, pm.paragraph())
		))
		const state = EditorState.create({ doc: content })
		const tr = state.tr
		fixBlockIds(tr, testSchema.nodes.item, 10)
		expect(tr.doc.child(0).child(0).attrs.blockId).toBe(duplicateId)
		expect(tr.doc.child(0).child(1).attrs.blockId).not.toBe(duplicateId)
	})
})
describe("getMarksInSelection", () => {
	it("works", () => {
		let state = EditorState.create({
			doc: pm.doc(pm.list(
				pm.item(pm.paragraph(
					pm.bold("Bold",
						pm.italic("Italic",
							pm.link({ href: "https://example.com" }, "link")
						)
					)
				))
			))
		})
		const boldPos = posByNode(state.doc, { type: "text", textContent: "Bold" })
		const italicPos = posByNode(state.doc, { type: "text", textContent: "Italic" })
		const linkPos = posByNode(state.doc, { type: "text", textContent: "link" })
		const endPos = linkPos + "link".length
		let tr = state.tr

		tr.setSelection(TextSelection.create(state.doc, boldPos))
		state = state.apply(tr)
		const marks = getMarksInSelection(state)
		expect(marks.length).toBe(1)
		expect(marks[0].type.name).toBe("bold")

		for (let i = 0; i < "bold".length; i++) {
			const pos = boldPos + i
			expect(getMarkPosition(state, "bold", pos)).toEqual({ from: boldPos, to: endPos })
		}

		tr = state.tr
		tr.setSelection(TextSelection.create(state.doc, italicPos))
		state = state.apply(tr)
		const marks2 = getMarksInSelection(state)
		expect(marks2.length).toBe(2)
		expect(marks2[0].type.name).toBe("italic")

		for (let i = 0; i < "italic".length; i++) {
			const pos = italicPos + i
			expect(getMarkPosition(state, "italic", pos)).toEqual({ from: italicPos, to: endPos })
		}

		tr = state.tr
		tr.setSelection(TextSelection.create(state.doc, linkPos))
		state = state.apply(tr)
		const marks3 = getMarksInSelection(state)
		expect(marks3.length).toBe(3)
		expect(marks3[0].type.name).toBe("link")

		for (let i = 0; i < "link".length; i++) {
			const pos = linkPos + i
			expect(getMarkPosition(state, "link", pos)).toEqual({ from: linkPos, to: endPos })
		}

		tr = state.tr
		tr.setSelection(TextSelection.create(state.doc, linkPos + "link".length))
		state = state.apply(tr)
		const marks4 = getMarksInSelection(state)
		expect(marks4.length).toBe(3)
		expect(marks4[0].type.name).toBe("link")
	})
})
