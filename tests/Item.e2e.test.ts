import type { Node } from "@tiptap/pm/model"
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

// we must test for all combinations of content and contentless blocks
// because the contentless blocks (embeds) require special handling
const sourceTargetNodePairs: [Node, Node][] = [
	[pm.paragraph("source"), pm.paragraph("target")],
	[
		pm.embeddedDoc({ embedId: { docId: "doc", blockId: "1".repeat(10) } }),
		pm.embeddedDoc({ embedId: { docId: "doc", blockId: "2".repeat(10) } })
	],
	[
		pm.paragraph("source"),
		pm.embeddedDoc({ embedId: { docId: "doc", blockId: "1".repeat(10) } })
	],
	[
		pm.embeddedDoc({ embedId: { docId: "doc", blockId: "2".repeat(10) } }),
		pm.paragraph("target")
	]
]
describe("Command - copyOrMoveItem", () => {
	async function moveToAfterTarget(source: Node, target: Node, move: boolean = true) {
		const { editor, c } = await setupWrapper(pm.doc(pm.list(
			pm.item(target),
			pm.item(pm.paragraph("item")),
			pm.item(source)
		)), { documents })
		const doc = editor.state.doc
		const targetPos = posByNode(doc, { textContent: target.textContent, type: target.type.name, attrs: target.attrs })
		const sourcePos = posByNode(doc, { textContent: source.textContent, type: source.type.name, attrs: source.attrs })
		editor.commands.copyOrMoveItem(sourcePos, targetPos, "after", { move })
		const changedDoc = editor.state.doc.toJSON()
		const expectedDoc = pm.doc(
			pm.list(
				pm.itemNoId(target),
				pm.itemNoId(source),
				pm.itemNoId(pm.paragraph("item")),
				...(!move ? [pm.itemNoId(source)] : [])
			)
		).toJSON()
		expect(isPartiallyEqual(changedDoc, expectedDoc)).to.equal(true)
		c.unmount()
	}
	describe("moves item upwards after target", async () => {
		it("p(source) - p(target)", async () => {
			await moveToAfterTarget(...sourceTargetNodePairs[0])
		})
		it("embed(source) - embed(target)", async () => {
			await moveToAfterTarget(...sourceTargetNodePairs[1])
		})
		it("p(source) - embed(target)", async () => {
			await moveToAfterTarget(...sourceTargetNodePairs[2])
		})
		it("embed(source) - p(target)", async () => {
			await moveToAfterTarget(...sourceTargetNodePairs[3])
		})
		it("p(source) - p(target) - copy", async () => {
			await moveToAfterTarget(...sourceTargetNodePairs[0], true)
		})
		it("embed(source) - embed(target) - copy", async () => {
			await moveToAfterTarget(...sourceTargetNodePairs[1], true)
		})
		it("p(source) - embed(target) - copy", async () => {
			await moveToAfterTarget(...sourceTargetNodePairs[2], true)
		})
		it("embed(source) - p(target) - copy", async () => {
			await moveToAfterTarget(...sourceTargetNodePairs[3], true)
		})
	})
	async function moveToBeforeTarget(source: Node, target: Node, move: boolean = true) {
		const { editor, c } = await setupWrapper(pm.doc(pm.list(
			pm.item(target),
			pm.item(pm.paragraph("item")),
			pm.item(source)
		)), { documents })
		const doc = editor.state.doc
		const targetPos = posByNode(doc, { textContent: target.textContent, type: target.type.name, attrs: target.attrs })
		const sourcePos = posByNode(doc, { textContent: source.textContent, type: source.type.name, attrs: source.attrs })
		editor.commands.copyOrMoveItem(sourcePos, targetPos, "before", { move })
		const changedDoc = editor.state.doc.toJSON()
		const expectedDoc = pm.doc(pm.list(
			pm.itemNoId(source),
			pm.itemNoId(target),
			pm.itemNoId(pm.paragraph("item")),
			...(!move ? [pm.itemNoId(source)] : [])
		)).toJSON()
		expect(isPartiallyEqual(changedDoc, expectedDoc)).to.equal(true)
		c.unmount()
	}
	describe("moves item upwards before target", async () => {
		it("p(source) - p(target)", async () => {
			await moveToBeforeTarget(...sourceTargetNodePairs[0])
		})
		it("embed(source) - embed(target)", async () => {
			await moveToBeforeTarget(...sourceTargetNodePairs[1])
		})
		it("p(source) - embed(target)", async () => {
			await moveToBeforeTarget(...sourceTargetNodePairs[2])
		})
		it("embed(source) - p(target)", async () => {
			await moveToBeforeTarget(...sourceTargetNodePairs[3])
		})
		it("p(source) - p(target) - copy", async () => {
			await moveToBeforeTarget(...sourceTargetNodePairs[0], true)
		})
		it("embed(source) - embed(target) - copy", async () => {
			await moveToBeforeTarget(...sourceTargetNodePairs[1], true)
		})
		it("p(source) - embed(target) - copy", async () => {
			await moveToBeforeTarget(...sourceTargetNodePairs[2], true)
		})
		it("embed(source) - p(target) - copy", async () => {
			await moveToBeforeTarget(...sourceTargetNodePairs[3], true)
		})
	})
	async function moveToChildOfTarget(source: Node, target: Node, move: boolean = true) {
		const { editor, c } = await setupWrapper(pm.doc(pm.list(
			pm.item(target, pm.list(
				pm.item(pm.paragraph("item")),
				pm.item(source)
			))
		)), { documents })
		const doc = editor.state.doc
		const targetPos = posByNode(doc, { textContent: target.textContent, type: target.type.name, attrs: target.attrs })
		const sourcePos = posByNode(doc, { textContent: source.textContent, type: source.type.name, attrs: source.attrs })
		editor.commands.copyOrMoveItem(sourcePos, targetPos, "child", { move })
		const changedDoc = editor.state.doc.toJSON()
		const expectedDoc = pm.doc(pm.list(
			pm.itemNoId(target, pm.list(
				pm.itemNoId(source),
				pm.itemNoId(pm.paragraph("item")),
				...(!move ? [pm.itemNoId(source)] : [])
			)
			)
		)).toJSON()
		expect(isPartiallyEqual(changedDoc, expectedDoc)).to.equal(true)
		c.unmount()
	}
	describe("moves item upwards as child of target with children", async () => {
		it("p(source) - p(target)", async () => {
			await moveToChildOfTarget(...sourceTargetNodePairs[0])
		})
		it("embed(source) - embed(target)", async () => {
			await moveToChildOfTarget(...sourceTargetNodePairs[1])
		})
		it("p(source) - embed(target)", async () => {
			await moveToChildOfTarget(...sourceTargetNodePairs[2])
		})
		it("embed(source) - p(target)", async () => {
			await moveToChildOfTarget(...sourceTargetNodePairs[3])
		})
		it("p(source) - p(target) - copy", async () => {
			await moveToChildOfTarget(...sourceTargetNodePairs[0], true)
		})
		it("embed(source) - embed(target) - copy", async () => {
			await moveToChildOfTarget(...sourceTargetNodePairs[1], true)
		})
		it("p(source) - embed(target) - copy", async () => {
			await moveToChildOfTarget(...sourceTargetNodePairs[2], true)
		})
		it("embed(source) - p(target) - copy", async () => {
			await moveToChildOfTarget(...sourceTargetNodePairs[3], true)
		})
	})

	async function moveToAfterTargetWithChildren(source: Node, target: Node, move: boolean = true) {
		const { editor, c } = await setupWrapper(pm.doc(pm.list(
			pm.item(
				target,
				pm.list(
					pm.item(pm.paragraph("item")),
					source
				)
			)
		)), { documents })
		const doc = editor.state.doc
		const targetPos = posByNode(doc, { textContent: target.textContent, type: target.type.name, attrs: target.attrs })
		const sourcePos = posByNode(doc, { textContent: source.textContent, type: source.type.name, attrs: source.attrs })
		editor.commands.copyOrMoveItem(sourcePos, targetPos, "after", { move })
		const changedDoc = editor.state.doc.toJSON()
		const expectedDoc = pm.doc(
			pm.list(
				pm.itemNoId(target),
				pm.itemNoId(
					source,
					pm.list(
						pm.itemNoId(pm.paragraph("item")),
						...(!move ? [pm.itemNoId(source)] : [])
					)
				)
			)
		).toJSON()
		expect(isPartiallyEqual(changedDoc, expectedDoc)).to.equal(true)

		c.unmount()
	}
	describe("moves item upwards as after when target has children (replaces target)", async () => {
		it("p(source) - p(target)", async () => {
			await moveToAfterTargetWithChildren(...sourceTargetNodePairs[0])
		})
		it("embed(source) - embed(target)", async () => {
			await moveToAfterTargetWithChildren(...sourceTargetNodePairs[1])
		})
		it("p(source) - embed(target)", async () => {
			await moveToAfterTargetWithChildren(...sourceTargetNodePairs[2])
		})
		it("embed(source) - p(target)", async () => {
			await moveToAfterTargetWithChildren(...sourceTargetNodePairs[3])
		})
		it("p(source) - p(target) - copy", async () => {
			await moveToAfterTargetWithChildren(...sourceTargetNodePairs[0], true)
		})
		it("embed(source) - embed(target) - copy", async () => {
			await moveToAfterTargetWithChildren(...sourceTargetNodePairs[1], true)
		})
		it("p(source) - embed(target) - copy", async () => {
			await moveToAfterTargetWithChildren(...sourceTargetNodePairs[2], true)
		})
		it("embed(source) - p(target) - copy", async () => {
			await moveToAfterTargetWithChildren(...sourceTargetNodePairs[3], true)
		})
	})
	async function moveToChildOfTargetWithoutChildren(source: Node, target: Node, move: boolean = true) {
		const { editor, c } = await setupWrapper(pm.doc(pm.list(
			pm.item(target),
			pm.item(source)
		)), { documents })
		const doc = editor.state.doc
		const targetPos = posByNode(doc, { textContent: target.textContent, type: target.type.name, attrs: target.attrs })
		const sourcePos = posByNode(doc, { textContent: source.textContent, type: source.type.name, attrs: source.attrs })

		editor.commands.copyOrMoveItem(sourcePos, targetPos, "child", { move })
		const changedDoc = editor.state.doc.toJSON()
		const expectedDoc = pm.doc(pm.list(
			pm.itemNoId(
				target,
				pm.list(
					pm.itemNoId(source)
				),
				...(!move ? [pm.itemNoId(source)] : [])
			)
		)
		).toJSON()

		expect(isPartiallyEqual(changedDoc, expectedDoc)).to.equal(true)
		c.unmount()
	}
	describe("moves item upwards as child when target has no children (creates them)", async () => {
		it("p(source) - p(target)", async () => {
			await moveToChildOfTargetWithoutChildren(...sourceTargetNodePairs[0])
		})
		it("embed(source) - embed(target)", async () => {
			await moveToChildOfTargetWithoutChildren(...sourceTargetNodePairs[1])
		})
		it("p(source) - embed(target)", async () => {
			await moveToChildOfTargetWithoutChildren(...sourceTargetNodePairs[2])
		})
		it("embed(source) - p(target)", async () => {
			await moveToChildOfTargetWithoutChildren(...sourceTargetNodePairs[3])
		})
		it("p(source) - p(target) - copy", async () => {
			await moveToChildOfTargetWithoutChildren(...sourceTargetNodePairs[0], true)
		})
		it("embed(source) - embed(target) - copy", async () => {
			await moveToChildOfTargetWithoutChildren(...sourceTargetNodePairs[1], true)
		})
		it("p(source) - embed(target) - copy", async () => {
			await moveToChildOfTargetWithoutChildren(...sourceTargetNodePairs[2], true)
		})
		it("embed(source) - p(target) - copy", async () => {
			await moveToChildOfTargetWithoutChildren(...sourceTargetNodePairs[3], true)
		})
	})
})
