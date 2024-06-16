import type { ResolvedPos } from "prosemirror-model"

import type { REL } from "@/components/Editor/types"


export function index_in(relative: REL | number, $pos: ResolvedPos): number {
	return $pos.index($pos.depth - 1 - relative)
}
