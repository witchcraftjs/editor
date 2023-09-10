import type { EditorState, Transaction } from "@tiptap/pm/state"
import { Step } from "@tiptap/pm/transform"

import { copyMeta } from "./copyMeta.js"

/* The schemas are different between editor states, this converts a transaction for use from one instance to another. */
export function convertTrForInstance(
	tr: Transaction,
	/** We convert to the schema from this state. */
	otherState: EditorState
): Transaction {
	const extTr = otherState.tr as Transaction
	copyMeta(tr, extTr)
	// see https://github.com/ueberdosis/tiptap/issues/1883
	// and https://github.com/ueberdosis/tiptap/issues/74#issuecomment-460206175
	const steps = JSON.parse(
		JSON.stringify(tr.steps)
	).map((step: any) => Step.fromJSON(otherState.schema, step))
	for (const step of steps) {
		extTr.step(step)
	}

	return extTr
}
