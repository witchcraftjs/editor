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
 * Sets up two collab peers, each rendering a root doc that embeds the same child doc.
 * Both peers hydrate their ydocs from one shared stored doc (like decoding the db state), so they share item identity.
 */
export async function setupPeerEmbeds({
	childContent,
	documents
}: {
	/** The embedded child document's content. */
	childContent: ReturnType<typeof pm.doc>
	/** The documents map for both peers (the child doc entry). */
	documents: Record<string, { content: unknown, title: string }>
}) {
	const docId = Object.keys(documents)[0]
	const rootContent = pm.doc(
		pm.list(
			pm.item(pm.embeddedDoc({ embedId: { docId } }))
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

	const editorA = first.editor as Editor
	const editorB = second.editor as Editor
	const embedA = getEmbeddedEditors(editorA, docId)[0]
	const embedB = getEmbeddedEditors(editorB, docId)[0]

	return { first, second, editorA, editorB, embedA, embedB }
}
