import { closeHistory } from "prosemirror-history"
import type { NodeType, ResolvedPos } from "prosemirror-model"
import { type EditorState, Plugin, PluginKey, type Transaction } from "prosemirror-state"
import { Decoration, DecorationSet, type EditorView } from "prosemirror-view"

import { type PluginListeners, SELF } from "../types.js"
import { findUp } from "../utils/old/findUp.js"


type HoverIndicatorListeners = PluginListeners<"mousedown" | "mousemove">
/**
 * Plugin to add decorations to nodes when they are hovered over and removes them when they are not.
 * Useful for reliably listening to hover changes in nodeViews and or indicating complex hover states (e.g. hovering over one element sets decorations in multiple places.)
 *
 * Option `type` can be a node type to check we are hovering over, or a string to check for a class name on the event target.
 *
 * The `className` option is set to `hover-indicator-[NAME]` where name is `type.name` or just `type` if it's a string if nothing is passed.
 *
 * The `modify` option to pass a function which can be used to modify what will be decorated. It should return an array of start and end positions to set the decorations to. Remember the positions must start 1 position before and after the node. If nothing is returned, the already calculated start/end positions (taken from the `$pos` parameters, e.g. `$pos.start/end() +/- 1`) will be used.
 */
export function hoverIndicator(
	{
		type,
		className,
		modify,
	}: {
		type: NodeType | string
		className?: string
		modify?: (tr: Transaction, $pos: ResolvedPos) => { start: number, end: number }[] | void | undefined
	}): Plugin {
	const name = typeof type === "string" ? type : type.name
	if (className === undefined) { className = `${name}-hover`}
	const key = new PluginKey(`hover-indicator-${name}`)
	return new Plugin<DecorationSet>({
		key,
		state: {
			init() { return DecorationSet.empty },
			apply(tr: Transaction, set: DecorationSet) {
				if (tr.getMeta("hide-hover-indicator")) {
					return DecorationSet.empty
				}
				const prevDecos = set.find()

				const $hover: ResolvedPos | false = tr.getMeta(`hover-indicator-${name}-hover`)
				if ($hover !== undefined) {
					set = set.remove(prevDecos)

					if ($hover !== false) {
						const start = $hover.start() - 1
						const end = $hover.end() + 1
						let locations = [{ start, end }]
						if (modify) {
							const res = modify(tr, $hover)
							if (res) {
								locations = res
							}
						}
						for (const location of locations) {
							set = set.add(tr.doc, [Decoration.node(location.start, location.end, { class: className! }, { type: `hover-indicator-${name}` })])
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
				mousemove(view: EditorView, e: MouseEvent) {
					let hovering = false
					let $found: ResolvedPos | undefined
					if (typeof type === "string") {
						if (e.target) {
							const el = e.target as HTMLElement
							if (el.classList.contains(type) && !el.classList.contains(className!)) {
								hovering = true
								$found = view.state.doc.resolve(view.posAtDOM(e.target as Element, 0))
							} else {
								hovering = false
							}
						}
					} else {
						const $node = view.state.doc.resolve(view.posAtDOM(e.target as Element, 0))
						const prevDecos = this.getState(view.state)?.find()
						$found = findUp(view.state.doc, $node, { start: SELF }, $pos => $pos.node().type === type)
						if (!$found) return true
						const hoveredAlready = prevDecos?.find(deco => deco.from === $found!.start() - 1) !== undefined
						if (hoveredAlready) return true
						hovering = $found !== undefined
					}

					const tr = view.state.tr
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
			decorations(state: EditorState) {
				return this.getState(state)
			},
		},
	})
}

