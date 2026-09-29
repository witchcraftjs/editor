import type { Node } from "@tiptap/pm/model"
import { prosemirrorToYDoc } from "@tiptap/y-tiptap"
import type * as Y from "yjs"

/** Converts a prosemirror doc to a fresh Y.Doc, like a client's initial load from the db. Validates against the schema first (yjs does not guard structure). */
// eslint-disable-next-line @typescript-eslint/naming-convention -- acronym false positive
export function makeYDoc(doc: Node, { bypassCheck = false }: { bypassCheck?: boolean } = {}): Y.Doc {
	if (!bypassCheck) {
		try {
			doc.check()
		} catch (error) {
			throw new Error(`You passed an invalid schema for a test:\n${(error as Error).message}\nIf this test intentionally uses invalid content, pass { bypassCheck: true }.`, { cause: error })
		}
	}
	return prosemirrorToYDoc(doc, "prosemirror")
}
