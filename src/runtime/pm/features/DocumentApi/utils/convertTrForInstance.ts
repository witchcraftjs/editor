import type { EditorState, Transaction } from "@tiptap/pm/state"
import { Step } from "@tiptap/pm/transform"

import { copyMeta } from "./copyMeta.js"

/* The schemas are different between editor states, this converts a transaction for use from one instance to another.
 *
 * Note that because of how tiptap works internally, baseTr must come FROM tiptap's tr that it hands you in commands. */
export function convertTrForInstance(
	/** The transaction to apply the steps to. */
	baseTr: Transaction,
	/** The transaction to convert. */
	extTr: Transaction,
	/** We convert to the schema from this state. */
	schema: EditorState["schema"]
): Transaction {
	copyMeta(extTr, baseTr)
	// see https://github.com/ueberdosis/tiptap/issues/1883
	// and https://github.com/ueberdosis/tiptap/issues/74#issuecomment-460206175
	const steps = JSON.parse(
		JSON.stringify(extTr.steps)
	).map((step: any) => Step.fromJSON(schema, step))
	for (const step of steps) {
		baseTr.step(step)
	}

	return baseTr
}
