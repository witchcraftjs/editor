import type { Node } from "prosemirror-model"
import type { Selection, Transaction } from "prosemirror-state"


export const mapSelection = (
	tr: Transaction,
	selection: Pick<Selection, "$from" | "$to">,

): Pick<Selection, "$from" | "$to"> => ({
	$from: tr.doc.resolve(tr.mapping.map(selection.$from.pos)),
	$to: tr.doc.resolve(tr.mapping.map(selection.$to.pos)),
})
