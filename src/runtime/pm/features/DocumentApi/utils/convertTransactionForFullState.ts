import { unreachable } from "@alanscodelog/utils/unreachable"
import type { EditorState, Transaction } from "@tiptap/pm/state"
import { Step, StepMap } from "@tiptap/pm/transform"

import { copyMeta } from "./copyMeta.js"
import { getStateEmbedRange } from "./getStateEmbedRange.js"

export function convertTransactionForFullState(
	state: EditorState,
	tr: Transaction
): Transaction {
	// this happens when we forward a transaction directly
	// which uses the real full state as the base (as happens with undo)

	const steps = tr.getMeta("no-schema-convert")
		? tr.steps
		: JSON.parse(
				JSON.stringify(tr.steps)
			).map((step: any) => Step.fromJSON(state.schema, step))

	const extTr = state.tr as Transaction
	copyMeta(tr, extTr)
	const trSubId = tr.doc.nodeAt(1)?.attrs.blockId
	if (!trSubId && !tr.getMeta("no-step-convert")) {
		unreachable()
	}
	const embedRange = trSubId ? getStateEmbedRange(tr.doc, trSubId) : undefined
	const offsetMap = embedRange && !tr.getMeta("no-step-convert")
		? StepMap.offset(embedRange.start !== undefined ? embedRange.start - 1 : 0)
		: undefined
	// see https://github.com/ueberdosis/tiptap/issues/1883
	// and https://github.com/ueberdosis/tiptap/issues/74#issuecomment-460206175
	for (const step of steps) {
		const mapped = offsetMap ? step.map(offsetMap)! : step
		extTr.step(mapped)
	}

	return extTr
}
