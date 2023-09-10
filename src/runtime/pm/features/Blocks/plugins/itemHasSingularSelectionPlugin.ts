import { Plugin, PluginKey } from "@tiptap/pm/state"
import { Decoration, DecorationSet } from "@tiptap/pm/view"

export const itemHasSingularSelectionPluginKey = new PluginKey("itemHasSingularSelectionPluginKey")

export function itemHasSingularSelectionPlugin(): Plugin {
	return new Plugin({
		// used to detect whether to show the handle
		// if the user is using touch
		key: itemHasSingularSelectionPluginKey,
		props: {
			decorations(state) {
				const selection = state.selection
				if (selection.from === selection.to) {
					if (selection.from === 0) return undefined
					const resolved = state.doc.resolve(selection.from)
					if (resolved.depth <= 1) return undefined
					const decoration = Decoration.node(
						resolved.before(-1),
						resolved.after(-1),
						// values are passed correctly to the node view
						// they can be booleans instead of strings at least
						// not sure objects
						{ hasSingularSelection: true } as any
					)
					return DecorationSet.create(state.doc, [decoration])
				}
				return undefined
			}
		}
	})
}
