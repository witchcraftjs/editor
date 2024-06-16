export const deleteSelection = () =>
	(): Command =>
		({ state, tr, dispatch }) => {
			const { from, to } = state.selection
			if (from !== to) {
				if (dispatch) tr.delete(from, to)
				return true
			}
			return false
		}
