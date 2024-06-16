import { debounce, keys } from "@alanscodelog/utils"
import { closeHistory } from "prosemirror-history"
import type { NodeType, ResolvedPos } from "prosemirror-model"
import { EditorState, Plugin, PluginKey, TextSelection, Transaction } from "prosemirror-state"
import { Decoration, DecorationSet, EditorView } from "prosemirror-view"

import { restore_offset, restore_selection, TaggedEvent_DragSelectionRestorer } from "./drag_selection_restorer"
import { style_element } from "./style_element"

import { FullHandleOptions, HandleOptions, PluginListeners, Rect, SELF } from "@/components/Editor/types"
import { find_up } from "@/components/Editor/utils"


type HoverIndicatorListeners = PluginListeners<"mousedown" | "mousemove">
/**
 * Plugin to add decorations to nodes when they are hovered over and removes them when they are not.
 * Useful for reliably listening to hover changes in nodeViews and or indicating complex hover states (e.g. hovering over one element sets decorations in multiple places.)
 *
 * Option `type` can be a node type to check we are hovering over, or a string to check for a class name on the event target.
 *
 * The `class_name` option is set to `hover-indicator-[NAME]` where name is `type.name` or just `type` if it's a string if nothing is passed.
 *
 * The `modify` option to pass a function which can be used to modify what will be decorated. It should return an array of start and end positions to set the decorations to. Remember the positions must start 1 position before and after the node. If nothing is returned, the already calculated start/end positions (taken from the `$pos` parameters, e.g. `$pos.start/end() +/- 1`) will be used.
 */
export function hover_indicator(
	{
		type,
		class_name,
		modify,
	}: {
		type: NodeType | string
		class_name?: string
		modify?: (tr: Transaction, $pos: ResolvedPos) => { start: number, end: number}[] | void | undefined
	}): Plugin {
	let name = typeof type === "string" ? type : type.name
	if (class_name === undefined) { class_name = `${name}-hover`}
	let key = new PluginKey(`hover-indicator-${name}`)
	return new Plugin<DecorationSet>({
		key,
		state: {
			init() { return DecorationSet.empty },
			apply(tr, set) {
				if (tr.getMeta("hide-hover-indicator")) {
					return DecorationSet.empty
				}
				let prev_decos = set.find()

				let $hover: ResolvedPos | false = tr.getMeta(`hover-indicator-${name}-hover`)
				if ($hover !== undefined) {
					set = set.remove(prev_decos)

					if ($hover !== false) {
						let start = $hover.start() - 1
						let end = $hover.end() + 1
						let locations = [{ start, end }]
						if (modify) {
							let res = modify(tr, $hover)
							if (res) {
								locations = res
							}
						}
						for (let location of locations) {
							set = set.add(tr.doc, [Decoration.node(location.start, location.end, { class: class_name! }, { type: `hover-indicator-${name}` })])
						}
					}
					return set
				}
				// return the same decorations mapped to any new changes
				return set.map(tr.mapping, tr.doc)
			},
		},
		props: {
			handleDOMEvents: {
				mousemove(view, e) {
					let hovering = false
					let $found: ResolvedPos | undefined
					if (typeof type === "string") {
						if (e.target) {
							let el = e.target as HTMLElement
							if (el.classList.contains(type) && !el.classList.contains(class_name!)) {
								hovering = true
								$found = view.state.doc.resolve(view.posAtDOM(e.target as Element, 0))
							} else {
								hovering = false
							}
						}
					} else {
						let $node = view.state.doc.resolve(view.posAtDOM(e.target as Element, 0))
						let prev_decos = this.getState(view.state).find()
						$found = find_up(view.state.doc, $node, { start: SELF }, $pos => $pos.node().type === type)
						if (!$found) return true
						let hovered_already = prev_decos.find(deco => deco.from === $found!.start() - 1) !== undefined
						if (hovered_already) return true
						hovering = $found !== undefined
					}

					let tr = view.state.tr
					tr.setMeta("addToHistory", false)
					closeHistory(tr)
					if (!hovering || !$found) {
						tr.setMeta(`hover-indicator-${name}-hover`, false)
					} else {
						tr.setMeta(`hover-indicator-${name}-hover`, $found)
					}
					view.dispatch(tr)
					return false
				},
			},
			decorations(state) {
				return this.getState(state)
			},
		},
	})
}

