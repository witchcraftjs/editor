import { delay } from "@alanscodelog/utils/delay"
import { describe, expect, it } from "vitest"
import { ref } from "vue"

import { linkPeers } from "./utils/linkPeers.js"
import { makePeerYDoc } from "./utils/makePeerYDoc.js"
import { makeYDoc } from "./utils/makeYDoc.js"
import { pm } from "./utils/pm.js"
import { setupPeerBlockEmbeds } from "./utils/setupPeerBlockEmbeds.js"
import { setupPeerEmbeds } from "./utils/setupPeerEmbeds.js"
import { setupWrapper } from "./utils/setupWrapper.js"
import { syncDocs } from "./utils/syncDocs.js"
import { textEnd } from "./utils/textEnd.js"

import { ySyncPluginKey } from "../src/runtime/pm/features/Collaboration/ySyncPlugin.js"

describe("Collaboration", () => {
	it("syncs editor changes into the ydoc", async () => {
		const { c, editor, testId } = await setupWrapper(pm.doc(pm.paragraph("hello")), { useCollab: true })
		try {
			const cache = (window as any)[`cache-${testId}`]
			editor.commands.insertContentAt(editor.state.doc.content.size - 1, " world")

			// the bridge lives on the per-doc state as a plugin, not on the cache entry
			const bridge = ySyncPluginKey.getState(cache.value.root.state)?.bridge
			expect(bridge).not.toBeNull()
			expect(bridge.fragment.toString()).toContain("hello")
		} finally {
			c?.unmount()
		}
	})

	/**
	 * Two peers with separate DocumentApi instances and separate Y.Docs, linked by relaying update messages between them.
	 * This simulates two browser tabs connected through a sync provider: each peer's updates arrive at the other as distinct remote transactions.
	 *
	 * Peer B joins by seeding its fragment from A's encoded state (like opening an existing document in a new tab), so both peers share item identity and edits merge correctly.
	 */
	it("syncs edits between two peers over relayed updates", async () => {
		const content = pm.doc(pm.list(pm.item(pm.paragraph("hello"))))
		// the stored doc (what the db would hold); both peers decode from it
		const dbDoc = makeYDoc(content)
		const firstCache = ref({ root: { yDoc: makePeerYDoc(dbDoc), count: 1 } })
		const first = await setupWrapper(content, { useCollab: true, cache: firstCache, ns: "peerA" })
		try {
			await delay(200)

			// peer B: own cache, hydrated from the same stored doc (like a second client decoding the db state)
			const secondCache = ref({ root: { yDoc: makePeerYDoc(dbDoc), count: 1 } })
			const second = await setupWrapper(content, { useCollab: true, cache: secondCache, ns: "peerB" })
			try {
				const yDocA = firstCache.value.root.yDoc
				const yDocB = secondCache.value.root.yDoc
				expect(yDocA).not.toBe(yDocB)

				syncDocs(yDocA, yDocB)
				linkPeers(yDocA, yDocB)
				await delay(300)

				// peer B should have A's content from the seed
				expect(JSON.stringify(second.editor.state.doc.toJSON())).toContain("hello")

				// type in peer A, expect the text to appear in peer B
				first.editor.commands.insertContentAt(textEnd(first), " world")
				await delay(300)
				expect(JSON.stringify(second.editor.state.doc.toJSON())).toContain("hello world")

				// and back the other way
				second.editor.commands.insertContentAt(textEnd(second), "!")
				await delay(300)
				expect(JSON.stringify(first.editor.state.doc.toJSON())).toContain("hello world!")
			} finally {
				second.c.unmount()
			}
		} finally {
			first.c.unmount()
		}
	})

	it("preserves the second peer's cursor when the first peer types above it", async () => {
		const content = pm.doc(pm.list(pm.item(pm.paragraph("hello world"))))
		const dbDoc = makeYDoc(content)
		const firstCache = ref({ root: { yDoc: makePeerYDoc(dbDoc), count: 1 } })
		const first = await setupWrapper(content, { useCollab: true, cache: firstCache, ns: "peerA" })
		try {
			const editor = first.editor
			await delay(200)

			// open a second peer hydrated from the same stored doc
			const secondCache = ref({ root: { yDoc: makePeerYDoc(dbDoc), count: 1 } })
			const second = await setupWrapper(content, { useCollab: true, cache: secondCache, ns: "peerB" })
			try {
				const editor2 = second.editor
				const yDocA = firstCache.value.root.yDoc
				const yDocB = secondCache.value.root.yDoc
				syncDocs(yDocA, yDocB)
				linkPeers(yDocA, yDocB)
				await delay(200)

				// put the cursor in the middle of the text: after "hello" (position 8, two levels deep into the list item's paragraph)
				editor2.commands.setTextSelection(8)
				expect(editor2.state.selection.anchor).toBe(8)

				// first peer types at the start of the text, above the second peer's cursor
				editor.commands.insertContentAt(3, "abc")
				await delay(200)

				// the second peer's doc updated and its cursor should have moved with the insertion (8 + 3)
				expect(JSON.stringify(editor2.state.doc.toJSON())).toContain("abchello world")
				expect(editor2.state.selection.anchor).toBe(11)
			} finally {
				second.c.unmount()
			}
		} finally {
			first.c.unmount()
		}
	})
})

describe("Collaboration - undo", () => {
	it("an editor can undo its own change (baseline)", async () => {
		const first = await setupWrapper(pm.doc(pm.paragraph("hello")), { useCollab: true })
		try {
			const editor = first.editor

			editor.commands.insertContentAt(editor.state.doc.content.size - 1, " world")
			expect(JSON.stringify(editor.state.doc.toJSON())).toContain(" world")

			await delay(200)
			const undid = editor.commands.undo()
			await delay(200)

			expect(undid).toBe(true)
			expect(JSON.stringify(editor.state.doc.toJSON())).not.toContain(" world")

			// redo restores the change
			const redid = editor.commands.redo()
			await delay(200)
			expect(redid).toBe(true)
			expect(JSON.stringify(editor.state.doc.toJSON())).toContain(" world")
		} finally {
			first.c.unmount()
		}
	})

	it("a peer cannot undo another peer's edit", async () => {
		const content = pm.doc(pm.list(pm.item(pm.paragraph("hello"))))
		const dbDoc = makeYDoc(content)
		const firstCache = ref({ root: { yDoc: makePeerYDoc(dbDoc), count: 1 } })
		const first = await setupWrapper(content, { useCollab: true, cache: firstCache, ns: "peerA" })
		try {
			await delay(200)

			const secondCache = ref({ root: { yDoc: makePeerYDoc(dbDoc), count: 1 } })
			const second = await setupWrapper(content, { useCollab: true, cache: secondCache, ns: "peerB" })
			try {
				const yDocA = firstCache.value.root.yDoc
				const yDocB = secondCache.value.root.yDoc

				syncDocs(yDocA, yDocB)
				linkPeers(yDocA, yDocB)
				await delay(300)

				first.editor.commands.insertContentAt(textEnd(first), " world")
				await delay(300)
				expect(JSON.stringify(second.editor.state.doc.toJSON())).toContain("hello world")

				// undo in peer B cannot revert peer A's edit: each peer's undo manager only tracks its own local pushes
				const undid = second.editor.commands.undo()
				await delay(300)
				expect(undid).toBe(false)
				expect(JSON.stringify(first.editor.state.doc.toJSON())).toContain(" world")
				expect(JSON.stringify(second.editor.state.doc.toJSON())).toContain(" world")

				// peer A can undo its own change, and the undo propagates to B
				const undidA = first.editor.commands.undo()
				await delay(300)
				expect(undidA).toBe(true)
				expect(JSON.stringify(first.editor.state.doc.toJSON())).not.toContain(" world")
				expect(JSON.stringify(second.editor.state.doc.toJSON())).not.toContain(" world")
			} finally {
				second.c.unmount()
			}
		} finally {
			first.c.unmount()
		}
	})

	it("a peer cannot undo another peer's changes", async () => {
		const content = pm.doc(pm.list(pm.item(pm.paragraph("hello"))))
		const dbDoc = makeYDoc(content)
		const firstCache = ref({ root: { yDoc: makePeerYDoc(dbDoc), count: 1 } })
		const first = await setupWrapper(content, { useCollab: true, cache: firstCache, ns: "peerA" })
		try {
			const editor = first.editor
			await delay(200)

			// open a second peer hydrated from the same stored doc, link before any edits
			const secondCache = ref({ root: { yDoc: makePeerYDoc(dbDoc), count: 1 } })
			const second = await setupWrapper(content, { useCollab: true, cache: secondCache, ns: "peerB" })
			try {
				const editor2 = second.editor
				const yDocA = firstCache.value.root.yDoc
				const yDocB = secondCache.value.root.yDoc
				syncDocs(yDocA, yDocB)
				linkPeers(yDocA, yDocB)
				await delay(200)

				// type in the first peer (now relayed to B as a remote transaction)
				editor.commands.insertContentAt(editor.state.doc.content.size - 1, " world")
				expect(JSON.stringify(editor.state.doc.toJSON())).toContain(" world")
				await delay(200)

				// B cannot undo A's change: the yjs undo manager only tracks local transactions
				const undid = editor2.commands.undo()
				await delay(200)
				expect(undid).toBe(false)
				expect(JSON.stringify(editor2.state.doc.toJSON())).toContain(" world")
				expect(JSON.stringify(editor.state.doc.toJSON())).toContain(" world")

				// A can undo its own change, and the undo propagates to B
				const undidA = editor.commands.undo()
				await delay(200)
				expect(undidA).toBe(true)
				expect(JSON.stringify(editor.state.doc.toJSON())).not.toContain(" world")
				expect(JSON.stringify(editor2.state.doc.toJSON())).not.toContain(" world")
			} finally {
				second.c.unmount()
			}
		} finally {
			first.c.unmount()
		}
	})
})

/**
 * Two peers, each with a root doc embedding the same child doc.
 * Mirrors the multi-peer tests above, but routed through embedded editors.
 */
describe("Collaboration - Embedded Documents", () => {
	// see non-embedded version above
	it("a peer cannot undo another peer's changes in an embedded doc", async () => {
		const documents = {
			child: { content: pm.doc(pm.list(pm.item(pm.paragraph("hello")))).toJSON(), title: "Child" }
		}

		const { first, second, embedA, embedB } = await setupPeerEmbeds({
			childContent: pm.doc(pm.list(pm.item(pm.paragraph("hello")))),
			documents
		})

		try {
			expect(embedA).toBeDefined()
			expect(embedB).toBeDefined()

			// type in the first peer's embed (now relayed to B as a remote transaction)
			embedA!.commands.insertContentAt(embedA!.state.doc.content.size - 1, " world")
			expect(JSON.stringify(embedA!.state.doc.toJSON())).toContain(" world")
			await delay(300)

			// B cannot undo A's change: the yjs undo manager only tracks local transactions
			const undid = embedB!.commands.undo()
			await delay(300)
			expect(undid).toBe(false)
			expect(JSON.stringify(embedB!.state.doc.toJSON())).toContain(" world")
			expect(JSON.stringify(embedA!.state.doc.toJSON())).toContain(" world")

			// A can undo its own change, and the undo propagates to B
			const undidA = embedA!.commands.undo()
			await delay(300)
			expect(undidA).toBe(true)
			expect(JSON.stringify(embedA!.state.doc.toJSON())).not.toContain(" world")
			expect(JSON.stringify(embedB!.state.doc.toJSON())).not.toContain(" world")
		} finally {
			second.c.unmount()
			first.c.unmount()
		}
	})

	// see non-embedded version above
	it("preserves the second peer's cursor when the first peer types above it", async () => {
		const documents = {
			child: { content: pm.doc(pm.list(pm.item(pm.paragraph("hello world")))).toJSON(), title: "Child" }
		}

		const { first, second, embedA, embedB } = await setupPeerEmbeds({
			childContent: pm.doc(pm.list(pm.item(pm.paragraph("hello world")))),
			documents
		})

		try {
			expect(embedA).toBeDefined()
			expect(embedB).toBeDefined()

			// put the cursor in the middle of the text: after "hello" (position 8)
			embedB!.commands.setTextSelection(8)
			expect(embedB!.state.selection.anchor).toBe(8)

			// first peer types at the start of the text, above the second peer's cursor
			embedA!.commands.insertContentAt(3, "abc")
			await delay(200)

			// the second peer's doc updated and its cursor should have moved with the insertion (8 + 3)
			expect(JSON.stringify(embedB!.state.doc.toJSON())).toContain("abchello world")
			expect(embedB!.state.selection.anchor).toBe(11)
		} finally {
			second.c.unmount()
			first.c.unmount()
		}
	})

	it("preserves the second peer's cursor in a block-scoped embed when the first peer types above it", async () => {
		const documents = {
			child: { content: pm.doc(pm.list(pm.item(pm.paragraph("hello world")))).toJSON(), title: "Child" }
		}

		const { first, second, embedA, embedB } = await setupPeerBlockEmbeds({
			childContent: pm.doc(pm.list(pm.item(pm.paragraph("hello world")))),
			documents
		})

		try {
			expect(embedA).toBeDefined()
			expect(embedB).toBeDefined()

			// put the cursor in the middle of the text: after "hello" (position 8)
			embedB!.commands.setTextSelection(8)
			expect(embedB!.state.selection.anchor).toBe(8)

			// first peer types at the start of the text, above the second peer's cursor
			embedA!.commands.insertContentAt(3, "abc")
			await delay(200)

			// the second peer's doc updated and its cursor should have moved with the insertion (8 + 3)
			expect(JSON.stringify(embedB!.state.doc.toJSON())).toContain("abchello world")
			expect(embedB!.state.selection.anchor).toBe(11)
		} finally {
			second.c.unmount()
			first.c.unmount()
		}
	})
})
