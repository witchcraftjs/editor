import * as Y from "yjs"

/**
 * Convergence of two peer ydocs via state vectors and diffs, simulating a real app's sync layer.
 *
 * `server` plays the role of the server doc: it receives `client`'s diff first, then sends back only what `client` is missing.
 */
export function syncDocs(server: Y.Doc, client: Y.Doc): void {
	const serverStateVector = Y.encodeStateVector(server)
	const clientStateVector = Y.encodeStateVector(client)

	const clientDiff = Y.encodeStateAsUpdate(client, serverStateVector)
	if (clientDiff.length > 0) {
		Y.applyUpdate(server, clientDiff)
	}

	const serverDiff = Y.encodeStateAsUpdate(server, clientStateVector)
	if (serverDiff.length > 0) {
		Y.applyUpdate(client, serverDiff)
	}
}
