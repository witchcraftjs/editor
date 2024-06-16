import { keys } from "@alanscodelog/utils"
import { mergeAttributes, Node } from "@tiptap/core"
import { VueNodeViewRenderer } from "@tiptap/vue-3"
import { Plugin } from "prosemirror-state"
import { Decoration, DecorationSet } from "prosemirror-view"

import { type StatefulNodeStates, statefulStates } from "./stateful.js"

import ItemNodeView from "../../components/ItemNodeView.vue"
import type { HTMLAttributesOptions } from "../../types.js"
import { rawCommands } from "../commands/index.js"

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Item = Node.create<HTMLAttributesOptions & {
	types: string[]
	states: StatefulNodeStates
}>({
	name: "item",
	// draggable: false,
	content: "block list? | list",
	// defining: true,
	// definingForContent: true,
	// definingAsContext: false,
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
				...keys(statefulStates).map(type => `stateful-${type}`),
				// "unordered-square",
			],
		}
	},
	addAttributes() {
		return {
			type: {
				default: "none",
			},
			state: {
				default: undefined,
			},
			hideChildren: {
				default: false,
			},
		}
	},

	parseHTML() {
		return [
			{
				tag: "div",
				// todo
				getAttrs: node => {
					const type = (node as HTMLElement).getAttribute("node-type")
					if (type && this.options.types.includes(type)) {
						if (type.startsWith("stateful")) {
							const state = (node as HTMLElement).getAttribute("node-state")
							const stateTypeEntry = this.options.states[type.slice(9)]
							if (stateTypeEntry !== undefined) {
								if (stateTypeEntry.entries.find(entry => entry.value === state) !== undefined) {
									// todo children
									return { type, state, hideChildren: false }
								} else {
									return { type, state: stateTypeEntry.default, hideChildren: false }
								}
							}
						}
						return { type }
					} else return type !== undefined ? null : false
				},
			},
			{ tag: "ol > li", attrs: { type: "ordered" } },
			{ tag: "ul > li", attrs: { type: "unordered" } },
		]
	},

	// eslint-disable-next-line @typescript-eslint/typedef
	renderHTML({ HTMLAttributes: attrs }) {
		return [
			"div",
			mergeAttributes(
				this.options.HTMLAttributes,
				{
					"node-type": attrs.type,
					"node-state": attrs.state,
					"node-hide-children": attrs.hideChildren,
				}
			),
			0,
		]
	},
	addCommands() {
		return {
			enter: rawCommands.enter.create(),
			changeListItemType: rawCommands.changeListItemType.create({
				nodeType: this.type,
				allowedValues: this.options.types,
				attributeKey: "type",
				allowedStates: statefulStates,
				stateAttributeKey: "state",
			}),
			deleteNodes: rawCommands.deleteNodes.create(),
			indentListItem: rawCommands.indentListItem.create("item"),
			unindentListItem: rawCommands.unindentListItem.create("item"),
		}
	},
	addKeyboardShortcuts() {
		const keyMap = ["q", "w", "e", "r", "t", "y"]
		return {
			...Object.fromEntries(this.options.types.map((type, i) => [
`Alt-Mod-${keyMap[i] ?? ""}`,
({ editor }) => {
	editor.commands.changeListItemType({ type })
	return true
},
			])),

			
		}
	},

	addNodeView() {
		return VueNodeViewRenderer(ItemNodeView)
	},
	addProseMirrorPlugins() {
		return [new Plugin({
			props: {
				// eslint-disable-next-line @typescript-eslint/typedef
				decorations(state) {
					const selection = state.selection
					if (selection.from === selection.to) {
						if (selection.from === 0) return undefined
						const resolved = state.doc.resolve(selection.from)
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
				},
			},
		})]
	},
})

