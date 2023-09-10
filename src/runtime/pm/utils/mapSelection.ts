import type { Selection, Transaction } from "@tiptap/pm/state"

/**
 * Mimicks mapping a selection for the "block selections" returned by {@link splitIntoChunks}.
 */
export const mapSelection = (
	tr: Transaction,
	selection: Pick<Selection, "$from" | "$to">

): Pick<Selection, "$from" | "$to"> & { from: number, to: number } => {
	const from = tr.mapping.map(selection.$from.pos)
	const $from = tr.doc.resolve(from)
	const to = tr.mapping.map(selection.$to.pos)
	const $to = tr.doc.resolve(to)
	return {
		$from,
		$to,
		from,
		to
	}
}
