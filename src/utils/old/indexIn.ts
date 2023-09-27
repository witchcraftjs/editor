import type { ResolvedPos } from "prosemirror-model"

import type { REL } from "../types.js"


export function indexIn(relative: REL | number, $pos: ResolvedPos): number {
	return $pos.index($pos.depth - 1 - relative)
}
