import type { EditorState } from "@tiptap/pm/state"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { Decoration, DecorationSet } from "@tiptap/pm/view"

export const placeholderPluginKey = new PluginKey("fileInserterPlaceholder")

export interface PlaceholderAction {
	add?: { id: string, pos: number, fileName: string, preview?: string, side?: number }
	remove?: { id: string }
	update?: { id: string, preview?: string }
}

export function placeholderPlugin(): Plugin<DecorationSet> {
	return new Plugin<DecorationSet>({
		key: placeholderPluginKey,
		state: {
			init() {
				return DecorationSet.empty
			},
			apply(tr, set) {
				set = set.map(tr.mapping, tr.doc)
				const action = tr.getMeta(placeholderPluginKey) as PlaceholderAction | undefined
				if (!action) return set

				if (action.add) {
					const widget = createPlaceholderWidget(action.add)
					const deco = Decoration.widget(action.add.pos, widget, { id: action.add.id, side: action.add.side })
					set = set.add(tr.doc, [deco])
				} else if (action.remove) {
					set = set.remove(set.find(undefined, undefined, spec => spec.id === action.remove!.id))
				} else if (action.update) {
					// Update existing widget DOM in-place when preview arrives
					const dom = document.querySelector(`[data-file-inserter-id="${action.update.id}"]`)
					if (dom && action.update.preview) {
						const inner = dom.querySelector("span")
						if (inner) {
							let img = dom.querySelector("img")
							if (!img) {
								img = document.createElement("img")
								img.className = "w-[150px] h-[100px] rounded object-cover"
								inner.insertBefore(img, inner.firstChild)
							}
							img.src = action.update.preview
						}
					}
				}
				return set
			}
		},
		props: {
			decorations(state) {
				return this.getState(state)
			}
		}
	})
}

function createPlaceholderWidget(entry: NonNullable<PlaceholderAction["add"]>): HTMLElement {
	// Outer span is inline-block so it sits on its own line but doesn't break
	// the inline flow when placed inside sub/sup text.
	const outer = document.createElement("span")
	outer.className = "inline-block leading-normal p-1"
	outer.setAttribute("data-file-inserter-id", entry.id)

	// Inner span is block-level with flex layout for the card content.
	const inner = document.createElement("span")
	inner.className
		= `
			flex
			flex-col
			items-center
			gap-1
			rounded-md
			border
			border-black/5
			shadow-sm
			shadow-black/20
			bg-accent-100
			dark:bg-accent-800
			text-accent-800
			text-xs
			dark:text-accent-200
			p-1
			w-[150px]
			block
		`
	outer.appendChild(inner)

	if (entry.preview) {
		const img = document.createElement("img")
		img.src = entry.preview
		img.className = "w-[150px] h-[100px] rounded object-cover"
		inner.appendChild(img)
	}

	const status = document.createElement("span")
	status.textContent = "Uploading..."
	inner.appendChild(status)

	const filename = document.createElement("span")
	filename.className = "truncate max-w-[150px]"
	filename.textContent = entry.fileName
	inner.appendChild(filename)

	return outer
}

/** Find the current position of a placeholder by ID. Returns undefined if not found. */
export function findPlaceholder(state: EditorState, id: string): number | undefined {
	const plugin = placeholderPlugin()
	const decos = plugin.getState(state)
	if (!decos) return undefined

	const found = decos.find(undefined, undefined, spec => spec.id === id)
	return found.length > 0 ? found[0].from : undefined
}

