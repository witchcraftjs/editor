import { keys } from "@alanscodelog/utils"
import { mergeAttributes, Node } from "@tiptap/core"
import { VueNodeViewRenderer } from "@tiptap/vue-3"
import { nanoid } from "nanoid"

import { changeItemType } from "./commands/changeItemType.js"
import { copyOrMoveItem } from "./commands/copyOrMoveItem.js"
import { deleteItem } from "./commands/deleteItem.js"
import { indentItem } from "./commands/indentItem.js"
import { closeItemMenu, openItemMenu, toggleItemMenu } from "./commands/itemMenuCommands.js"
import { moveItem } from "./commands/moveItem.js"
import { splitItem } from "./commands/splitItem.js"
import { unindentItem } from "./commands/unindentItem.js"
import ItemNodeView from "./components/ItemNodeView.vue"
import { ensureLastItemIsContentPlugin } from "./plugins/ensureLastItemIsContentPlugin.js"
import { itemBlockIdPlugin } from "./plugins/itemBlockIdPlugin.js"
import { itemHasSingularSelectionPlugin } from "./plugins/itemHasSingularSelectionPlugin.js"
import { itemMenuPlugin } from "./plugins/itemMenuPlugin.js"
import { statefulStates } from "./states/stateful.js"
import { itemMenuPluginKey, type ItemNodeOptions } from "./types.js"

declare module "@tiptap/core" {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		item: {
			deleteItem: (pos?: number) => ReturnType
		}
	}
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Item = Node.create<ItemNodeOptions>({
	name: "item" satisfies NodeItemName,
	content: "block list? | list",

	addOptions() {
		return {
			HTMLAttributes: {},
			states: statefulStates,
			types: [
				"none",
				"ordered",
				// todo list all list-style-types
				"unordered",
				"ordered-upper-roman",
				"ordered-lower-roman",
				...keys(statefulStates).map(type => `stateful-${type}`)
				// "unordered-square",
			],
			idLength: 10,
			allowAnyIdLength: true,
			ensureLastItemIsParagraph: true
		}
	},
	addAttributes() {
		return {
			type: {
				default: "none"
			},
			state: {
				default: undefined
			},
			hideChildren: {
				default: false
			},
			blockId: {
				default: () => nanoid(this.options.idLength),
				keepOnSplit: false
			}
		}
	},

	parseHTML() {
		return [
			{
				tag: "li",
				// totest
				getAttrs: node => {
					const blockId = (node as HTMLElement).getAttribute("blockid") ?? nanoid(this.options.idLength)
					const type = (node as HTMLElement).getAttribute("type")
					const hideChildren = (node as HTMLElement).getAttribute("hidechildren")
					const base = { type, hideChildren: hideChildren === "true", blockId }
					if (type && this.options.types.includes(type)) {
						if (type.startsWith("stateful")) {
							const state = (node as HTMLElement).getAttribute("state")
							const stateTypeEntry = this.options.states[type.slice(9)]
							if (stateTypeEntry !== undefined) {
								if (stateTypeEntry.entries.find(entry => entry.value === state) !== undefined) {
									// todo children
									return { ...base, state }
								} else {
									return { ...base, state: stateTypeEntry.default }
								}
							}
						}
						return base
					} else {
						const role = (node as HTMLElement).getAttribute("role")
						const ariaChecked = (node as HTMLElement).getAttribute("aria-checked")
						if (role === "checkbox") {
							if (ariaChecked === "true") {
								return { type, state: "checked", blockId }
							} else {
								return { type, state: "unchecked", blockId }
							}
						}
					}
					return type !== undefined ? null : false
				}
			},
			{ tag: "ol > li", attrs: { type: "ordered", blockId: nanoid(this.options.idLength) } },
			{ tag: "ul > li", attrs: { type: "unordered" }, blockId: nanoid(this.options.idLength) }
		]
	},

	// eslint-disable-next-line @typescript-eslint/naming-convention
	renderHTML({ HTMLAttributes }) {
		return [
			"li",
			mergeAttributes(
				this.options.HTMLAttributes,
				HTMLAttributes
			),
			0
		]
	},
	addCommands() {
		return {
			changeItemType: changeItemType({
				nodeType: this.name,
				allowedValues: this.options.types,
				attributeKey: "type",
				allowedStates: statefulStates,
				stateAttributeKey: "state"
			}),
			deleteItem: deleteItem(this.name),
			indentItem: indentItem(this.name, "list"),
			unindentItem: unindentItem(this.name),
			copyOrMoveItem: copyOrMoveItem(),
			moveItem: moveItem(this.name),
			splitItem: splitItem(this.name),
			openItemMenu: openItemMenu(this.name),
			closeItemMenu: closeItemMenu(),
			toggleItemMenu: toggleItemMenu()
		}
	},

	addNodeView() {
		return VueNodeViewRenderer(ItemNodeView as any)
	},

	onCreate() {
		if ("registerMenu" in this.editor.commands) {
			this.editor.commands.registerMenu({
				type: "context",
				closeCommand: "closeItemMenu",
				name: "itemMenu",
				pluginKey: itemMenuPluginKey,
				priority: 100,
				canShow: (_state, pluginState) => !!pluginState?.opened
			})
		}
	},
	addProseMirrorPlugins() {
		const self = this
		return [
			ensureLastItemIsContentPlugin("paragraph", this.name, {
				initialState: this.options.ensureLastItemIsParagraph ?? true
			}),
			itemMenuPlugin(),
			itemBlockIdPlugin(self),
			itemHasSingularSelectionPlugin()
		]
	}
})
export type NodeItemName = "item"
