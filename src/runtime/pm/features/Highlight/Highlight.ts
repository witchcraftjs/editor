import { keys } from "@alanscodelog/utils/keys"
import {
	Mark,
	markInputRule,
	markPasteRule,
	mergeAttributes
} from "@tiptap/core"
import { Plugin } from "@tiptap/pm/state"

import { inputRegex, pasteRegex } from "./retyped/tiptapHighlight.js"
import { type HighlightMarkOptions, highlightPluginKey } from "./types.js"

import { createStateOnlyPluginObjApply } from "../../utils/createStateOnlyPluginObjApply.js"

declare module "@tiptap/core" {

	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		highlight: {
			/**
			 * Set a highlight mark.
			 *
			 * The color must be one of the keys in the configured `colors` option or it will throw an error.
			 *
			 * If no color is provided, the default color will be used.
			 */
			setHighlight: (color?: keyof HighlightMarkOptions["colors"]) => ReturnType
			/**
			 * Toggle a highlight mark.
			 *
			 * The color must be one of the keys in the configured `colors` option or it will throw an error.
			 *
			 * If no color is provided, the default color will be used.
			 */
			toggleHighlight: (color?: keyof HighlightMarkOptions["colors"]) => ReturnType
			/**
			 * Unset a highlight mark.
			 */
			unsetHighlight: () => ReturnType
			/**
			 * Set the highlight options.
			 *
			 * Note that you will need to keep the same keys to avoid having to manually migrate the doc. You can add more keys, but again, not remove any without having to migrate the doc. That's why they are named slot* by default, to avoid tight coupling with colors.
			 */
			setHighlightOptions: (options: Partial<HighlightMarkOptions>) => ReturnType
		}
	}
}

export const defaultColors = {
	slot1: {
		name: "Yellow",
		color: "rgba(255, 234, 54, 0.5)",
		matches: ["#ffff00", "yellow"]
	},
	slot2: {
		name: "Orange",
		color: "rgba(255, 132, 0, 0.5)",
		matches: ["#ffa500", "orange"]
	},
	slot3: {
		name: "Red",
		color: "rgba(255, 0, 0, 0.5)",
		matches: ["#ff0000", "red"]
	},
	slot4: {
		name: "Green",
		color: "rgba(70, 177, 0, 0.5)",
		matches: ["#008000", "green"]
	},
	slot5: {
		name: "Blue",
		color: "rgba(0, 101, 255, 0.5)",
		matches: ["#0000ff", "blue"]
	}
}

/**
 * For highlighting text with pre-configured colors.
 *
 * Colors can be changed on the fly using setHighlightOptions.
 *
 * The Commands feature includes a HighlightIcon component designed to work with this extension. It's included in the CommandBar menu by default.
 *
 * See also `createToggleHighlightCommand` in commandBarMenuItems.ts for creating a custom number of commands with custom prefixes if needed.
 */

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Highlight = Mark.create<HighlightMarkOptions>({
	name: "highlight" satisfies MarkHighlightName,
	addOptions() {
		return {
			defaultColor: "slot1",
			colors: defaultColors,
			HTMLAttributes: {}
		}
	},

	addAttributes() {
		return {
			color: {
				default: null,
				parseHTML: element => {
					const color = element.getAttribute("data-color")
					// <mark data-color="slot1"></mark>
					if (color && color in this.options.colors) {
						return color
					}

					// <mark style="background-color: yellow"></mark>
					const bgColor = element.style.backgroundColor
					// attempt to match against the color (unlikely) or alternative matches
					const foundSimilar = keys(this.options.colors).find(key => {
						const c = this.options.colors[key]
						if (
							c.color === color
							|| (color && c.matches?.includes(color))
							|| c.color === bgColor
							|| c.matches?.includes(bgColor)
						) return true
						return false
					})

					if (foundSimilar) {
						return foundSimilar
					}

					if (color) {
						return this.options.defaultColor
					}

					return false
				},
				renderHTML: attributes => {
					const color = attributes.color as keyof HighlightMarkOptions["colors"]
					// is this even possible? it was in the original tiptap code
					if (!color) {
						return {}
					}

					const finalColor = this.options.colors[color]
					return {
						"data-color": finalColor.color,
						style: `background-color: ${finalColor.color}; color: inherit`
					}
				}
			}
		}
	},

	parseHTML() {
		return [
			{
				tag: "mark"
			}
		]
	},

	// eslint-disable-next-line @typescript-eslint/naming-convention
	renderHTML({ HTMLAttributes }) {
		return ["mark", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
	},

	addCommands() {
		return {
			setHighlightOptions: (options: Partial<HighlightMarkOptions>) => ({ tr, dispatch }) => {
				if (dispatch) {
					tr.setMeta(highlightPluginKey, {
						...options,
						colors: (options.colors ? { ...options.colors } : undefined)
					})
				}
				return true
			},
			setHighlight: color => ({ commands }) => {
				if (color === undefined) {
					return commands.setMark(this.name, { color: this.options.defaultColor })
				}
				if (color in this.options.colors) {
					return commands.setMark(this.name, { color })
				} else {
					// typescript eslint is drunk, color is not an object
					throw new Error(`Color ${color as string} not found in the Highlight options.`)
				}
			},
			toggleHighlight: color => ({ commands }) => {
				if (color === undefined) {
					return commands.toggleMark(this.name, { color: this.options.defaultColor })
				}
				if (color in this.options.colors) {
					return commands.toggleMark(this.name, { color })
				} else {
					throw new Error(`Color ${color as string} not found in the Highlight options.`)
				}
			},
			unsetHighlight: () => ({ commands }) => commands.unsetMark(this.name)
		}
	},
	addProseMirrorPlugins() {
		const self = this
		return [
			new Plugin({
				key: highlightPluginKey,
				state: {
					init() {
						return {
							...self.options,
							colors: { ...self.options.colors }
						}
					},
					apply: createStateOnlyPluginObjApply(highlightPluginKey)
				}
			})
		]
	},
	addInputRules() {
		return [
			markInputRule({
				find: inputRegex,
				type: this.type
			})
		]
	},

	addPasteRules() {
		return [
			markPasteRule({
				find: pasteRegex,
				type: this.type
			})
		]
	}
})
export type MarkHighlightName = "highlight"
