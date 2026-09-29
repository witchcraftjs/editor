import type { Command } from "@tiptap/core"
import type { Transaction } from "@tiptap/pm/state"

import { convertTrForInstance } from "../../DocumentApi/utils/convertTrForInstance.js"

declare module "@tiptap/core" {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		convertTrForInstanceAndDispatch: {
			/**
			 * If we try to dispatch a handmade transaction, tiptap does something weird
			 * internally where it strips the meta or something, not sure what's happening. The
			 * point is we need to use the transaction it generates internally instead of accessing
			 * editor.state.tr directly.
			 */
			convertTrForInstanceAndDispatch: (newTr: Transaction) => ReturnType
		}
	}
}

export const convertTrForInstanceAndDispatch = () =>
	(newTr: Transaction): Command =>
		({ tr, state, dispatch }) => {
			const convertedTr = convertTrForInstance(tr, newTr, state.schema)
			if (dispatch) {
				dispatch(convertedTr)
				return true
			}

			return false
		}
