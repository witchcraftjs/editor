import * as Y from "yjs"

const REMOTE_ORIGIN = Symbol("remote-peer")

/**
 * Simulates two network peers with separate Y.Docs, like two browser tabs connected through a sync provider.
 *
 * Relays every update message between the two docs in both directions (the minimal thing a sync provider does).
 * Relayed updates are applied with a shared remote origin token so each peer's fragment observer treats them as external changes (not local pushes) and each peer's undo manager ignores them (peers cannot undo each other's edits).
 */
export function linkPeers(a: Y.Doc, b: Y.Doc): () => void {
	const unsubA = a.on("update", (update: Uint8Array, origin: unknown) => {
		if (origin === REMOTE_ORIGIN) return
		b.transact(() => Y.applyUpdate(b, update), REMOTE_ORIGIN)
	})
	const unsubB = b.on("update", (update: Uint8Array, origin: unknown) => {
		if (origin === REMOTE_ORIGIN) return
		a.transact(() => Y.applyUpdate(a, update), REMOTE_ORIGIN)
	})
	return () => {
		unsubA()
		unsubB()
	}
}
