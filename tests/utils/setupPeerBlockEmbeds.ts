import { delay } from "@alanscodelog/utils/delay"
import type { Editor } from "@tiptap/core"
import { ref } from "vue"

import { getEmbeddedEditors } from "./getEmbeddedEditors.js"
import { linkPeers } from "./linkPeers.js"
import { makePeerYDoc } from "./makePeerYDoc.js"
import { makeYDoc } from "./makeYDoc.js"
import { pm } from "./pm.js"
import { setupWrapper } from "./setupWrapper.js"
import { syncDocs } from "./syncDocs.js"

/**
 * Sets up two collab peers, each rendering a root doc that embeds a single block of the same child doc.
 * The child's first item is found after load and both peers' embed nodes are pointed at it via blockId,
 * so each embedded editor holds only that block (a partial view of the child doc).
 */
export async function setupPeerBlockEmbeds({
	childContent,
	documents
}: {
	/** The embedded child document's content. Must contain at least one list item. */
	childContent: ReturnType<typeof pm.doc>
	/** The documents map for both peers (the child doc entry). */
	documents: Record<string, { content: unknown, title: string }>
}) {
	const docId = Object.keys(documents)[0]
	const rootContent = pm.doc(
		pm.list(
			pm.item(pm.embeddedDoc({ embedId: { docId, blockId: "PENDING" } }))
		)
	)

	// the stored docs (what the db would hold); both peers decode from them so they share item identity
	const dbRoot = makeYDoc(rootContent)
	const dbChild = makeYDoc(childContent)

	const cacheA = ref({
		root: { yDoc: makePeerYDoc(dbRoot), count: 1 },
		child: { yDoc: makePeerYDoc(dbChild), count: 1 }
	})
	const first = await setupWrapper(rootContent, { documents, useCollab: true, cache: cacheA, ns: "peerA" })
	await delay(200)

	const cacheB = ref({
		root: { yDoc: makePeerYDoc(dbRoot), count: 1 },
		child: { yDoc: makePeerYDoc(dbChild), count: 1 }
	})
	const second = await setupWrapper(rootContent, { documents, useCollab: true, cache: cacheB, ns: "peerB" })

	// link root docs and child docs between peers
	syncDocs(cacheA.value.root.yDoc, cacheB.value.root.yDoc)
	linkPeers(cacheA.value.root.yDoc, cacheB.value.root.yDoc)
	syncDocs(cacheA.value.child.yDoc, cacheB.value.child.yDoc)
	linkPeers(cacheA.value.child.yDoc, cacheB.value.child.yDoc)
	await delay(300)

	// read the child's first item's blockId from peer A's cached child state
	let blockId: string | undefined
	cacheA.value.child.state.doc.descendants((node: any) => {
		if (node.type.name === "item" && node.attrs.blockId && !blockId) {
			blockId = node.attrs.blockId as string
			return false
		}
		return true
	})
	if (!blockId) throw new Error("Child doc has no list item to embed")

	const editorA = first.editor as Editor
	const editorB = second.editor as Editor

	// point both peers' embed nodes at the real block
	for (const editor of [editorA, editorB]) {
		const tr = editor.state.tr
		let found = false
		editor.state.doc.descendants((node: any, pos: number) => {
			if (!found && node.type.name === "embeddedDoc") {
				tr.setNodeMarkup(pos, undefined, { embedId: { docId, blockId } })
				found = true
				return false
			}
			return true
		})
		if (!found) throw new Error("No embeddedDoc node found in root doc")
		editor.view.dispatch(tr)
	}
	await delay(300)

	const embedA = getEmbeddedEditors(editorA, docId)[0]
	const embedB = getEmbeddedEditors(editorB, docId)[0]

	return { first, second, editorA, editorB, embedA, embedB }
}
