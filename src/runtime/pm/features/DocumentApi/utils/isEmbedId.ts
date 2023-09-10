import type { EmbedId, MaybeEmbedId } from "../types.js"

export function isEmbedId(embedId: MaybeEmbedId): embedId is EmbedId {
	return embedId.docId !== undefined
}
