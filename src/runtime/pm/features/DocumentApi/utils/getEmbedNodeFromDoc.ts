import { walk } from "@alanscodelog/utils/walk"

export function getEmbedNodeFromDoc(json: Record<string, any>, subId: string | undefined): Record<string, any> | undefined {
	if (!subId) return
	let nodeWanted: Record<string, any> | undefined
	walk(json.content, el => {
		if (!nodeWanted && el && el.type === "item") {
			if (el.attrs.blockId === subId) {
				nodeWanted = el
			}
		}
		return el
	}, { before: true })
	return nodeWanted
}
