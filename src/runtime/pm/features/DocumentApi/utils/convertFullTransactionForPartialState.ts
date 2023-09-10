import type { EditorState, Transaction } from "@tiptap/pm/state"
import { type ReplaceStep, Step } from "@tiptap/pm/transform"

import { copyMeta } from "./copyMeta.js"
import { getStateEmbedRange } from "./getStateEmbedRange.js"

import { getDiffReplacementRange } from "../../../utils/getDiffReplacementRange.js"
import type { EmbedId } from "../types.js"

export function convertFullTransactionForPartialState(
	state: EditorState,
	tr: Transaction,
	embedId: EmbedId
): Transaction | undefined {
	const blockId = embedId.blockId
	if (!blockId) {
		// see https://github.com/ueberdosis/tiptap/issues/1883
		// and https://github.com/ueberdosis/tiptap/issues/74#issuecomment-460206175
		const steps: ReplaceStep[] = JSON.parse(
			JSON.stringify(tr.steps)
		).map((step: any) => Step.fromJSON(state.schema, step))
		// the documents are the same
		const intTr = state.tr as Transaction
		copyMeta(tr, intTr)
		intTr.setMeta("ignore", true)
		for (const step of steps) {
			intTr.step(step)
		}
		return intTr
	}

	const { start: nodeStartExisting } = getStateEmbedRange(state.doc, embedId)
	const { start: nodeStart } = getStateEmbedRange(
		tr.doc,
		embedId
	)
	if (nodeStart === undefined || nodeStartExisting === undefined) return undefined
	const intTr = state.tr as Transaction
	copyMeta(tr, intTr)

	intTr.setMeta("ignore", true)
	const existingNode = state.doc.nodeAt(nodeStartExisting)
	const newNode = tr.doc.nodeAt(nodeStart)
	const convertedNewNode = newNode ? state.schema.nodeFromJSON(newNode.toJSON()) : undefined
	if (!existingNode || !convertedNewNode) return undefined

	// when the change crosses a boundary it's way too hard to find the right steps
	// so we just replace the whole different part
	const diff = getDiffReplacementRange(existingNode, convertedNewNode, nodeStartExisting - 1)
	if (diff) {
		intTr.replace(2 + diff.start, 2 + diff.end, convertedNewNode.slice(diff.sliceStart, diff.sliceEnd))
	}
	return intTr
}
