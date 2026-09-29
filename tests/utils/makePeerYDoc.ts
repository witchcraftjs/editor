import * as Y from "yjs"

/** Creates a fresh peer Y.Doc hydrated from the server/db doc's state, like a client decoding the stored document. Item identity is shared with the source. */
// eslint-disable-next-line @typescript-eslint/naming-convention -- acronym false positive
export function makePeerYDoc(source: Y.Doc): Y.Doc {
	const doc = new Y.Doc()
	Y.applyUpdate(doc, Y.encodeStateAsUpdate(source))
	return doc
}
