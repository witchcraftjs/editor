export const enter = () =>
	(): Command =>
		({ state, dispatch, view }) => splitListItem(nodeType)(state, dispatch, view)
