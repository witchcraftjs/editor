/* eslint-disable @typescript-eslint/naming-convention */
import { keys } from "@alanscodelog/utils"
import { Extension, getSchema, Mark, mergeAttributes, Node } from "@tiptap/core"
import { History } from "@tiptap/extension-history"
import { VueNodeViewRenderer } from "@tiptap/vue-3"
import { type ParseRule } from "prosemirror-model"

import { type StatefulNodeStates, statefulStates } from "./stateful.js"

import ItemNodeView from "../components/ItemNodeView.vue"
import { rawCommands } from "../core/commands.js"
import { debugSelection } from "../plugins/debugSelection.js"


type HTMLAttributesOptions = {
	HTMLAttributes: Record<string, any>
}

export const Document = Node.create({
	name: "doc",
	topNode: true,
	content: "list*",
})
export const Dummy = Node.create({
	name: "dummy",
	content: "(item|block)*",
	priority: 0,
})
export const List = Node.create({
	name: "list",
	content: "item+",
	addOptions() {
		return { HTMLAttributes: {} }
	},
	addAttributes() {
		return {
			type: {
				default: "list",
			},
		}
	},


	parseHTML() {
		return	[
			{
				tag: "div",
				getAttrs: node => {
					const type = (node as HTMLElement).getAttribute("node-type")
					if (type === "list") {
						return { type }
					} else return false
				},

			},
			{ tag: "ol" },
			{ tag: "ul" },
		]
	},
	// eslint-disable-next-line @typescript-eslint/typedef
	renderHTML({ HTMLAttributes, node }) {
		return [
			"div",
			mergeAttributes(
				this.options.HTMLAttributes,
				{
					"node-type": node.attrs.type,
				},
				HTMLAttributes
			),
			0,
		]
	},
})

export const Item = Node.create<HTMLAttributesOptions & {
	types: string[]
	states: StatefulNodeStates
}>({
	name: "item",
	draggable: false,
	content: "block list?",
	defining: false,
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
		return	[
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
	renderHTML({ HTMLAttributes, node }) {
		return [
			"div",
			mergeAttributes(
				this.options.HTMLAttributes,
				{
					"node-type": node.attrs.type,
					"node-state": node.attrs.state,
					"node-hide-children": node.attrs.hideChildren,
				},
				HTMLAttributes
			),
			0,
		]
	},
	addCommands() {
		return {
			enter: rawCommands.enter.create(this.type),
			changeListItemType: rawCommands.changeListItemType.create({
				nodeType: this.type,
				allowedValues: this.options.types,
				attributeKey: "type",
				allowedStates: statefulStates,
				stateAttributeKey: "state",
			}),
			deleteNodes: rawCommands.deleteNodes.create({ nodeType: this.type }),
		}
	},
	addKeyboardShortcuts() {
		const keyMap = ["q", "w", "e", "r", "t", "y"]
		return {
			...Object.fromEntries(this.options.types.map((type, i) => [
			`Alt-Mod-${keyMap[i]}`,
			({ editor }) => {
				editor.commands.changeTypeAttr({ type })
				return true
			},
			
			])),
			Enter: ({ editor }) => {
				editor.commands.enter()
				return true
			},
		}
	},

	addNodeView() {
		return VueNodeViewRenderer(ItemNodeView)
	},
})

export const Text = Node.create({
	name: "text",
	group: "inline",
})

export const Paragraph = Node.create<HTMLAttributesOptions>({
	name: "paragraph",
	group: "block",
	draggable: false,
	content: "inline*",
	addOptions() {
		return { HTMLAttributes: {} }
	},
	parseHTML() { return [{ tag: "p" }] },
	// eslint-disable-next-line @typescript-eslint/typedef
	renderHTML({ HTMLAttributes }) {
		return [
			"p",
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
				class: "pm-block block",

			}),
			0,
		]
	},
})

export const HardBreak = Node.create({
	name: "hardBreak",
	inline: true,
	group: "inline",
	selectable: false,
	renderHTML() { return ["br"] },
	parseHTML() { return [{ tag: "br" }] },
})

export const Heading = Node.create<HTMLAttributesOptions & {
	levels: number[]
}>({
	name: "heading",
	group: "block",
	content: "inline*",
	draggable: false,
	addOptions() {
		return {
			levels: [1, 2, 3, 4, 5, 6],
			HTMLAttributes: {},
		}
	},
	addAttributes() {
		return {
			level: {
				default: undefined,
				rendered: false,
			},
		}
	},
	parseHTML() {
		return this.options.levels.map(level => ({ tag: `h${level}`, attrs: { level } }))
	},
	// eslint-disable-next-line @typescript-eslint/typedef
	renderHTML({ HTMLAttributes, node }) {
		const level = this.options.levels.includes(node.attrs.level)
			? node.attrs.level
			: this.options.levels[0]
		const classMap = [
			"text-6xl/normal",
			"text-5xl/normal",
			"text-4xl/normal",
			"text-3xl/normal",
			"text-2xl/normal",
			"text-xl",
		]

		return [
			`h${level}`,
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
				class: `pm-block block ${classMap[level - 1]!}`,
				level,
			}),
			0,
		]
	},
	addCommands() {
		return {
			changeLevelAttr: rawCommands.changeLevelAttr.create({
				attributeKey: "level",
				nodeType: this.type,
				allowedValues: this.options.levels,
				fallbackGroups: ["block"],
			}),
		}
	},

	addKeyboardShortcuts() {
		return Object.fromEntries(this.options.levels.map(level => [
			`Mod-Alt-${level}`,
			({ editor }) => {
				editor.commands.changeLevelAttr({ level })
				return true
			},
		]))
	},
})
export const Image = Node.create<HTMLAttributesOptions & {
}>({
	name: "image",
	group: "inline",
	inline: true,
	draggable: false,
	addAttributes() {
		return {
			src: { default: "" },
		}
	},
	parseHTML() { return [{ tag: "image" }] },
	// eslint-disable-next-line @typescript-eslint/typedef
	renderHTML({ HTMLAttributes }) {
		return [
			"image",
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
			0,
		]
	},
})
export const Em = Mark.create({
	name: "em",
	parseHTML() {
		return [
			{
				tag: "i",
				getAttrs: node => (node as HTMLElement).style.fontStyle !== "normal" && null,
			},
			{
				tag: "em",
				getAttrs: node => (node as HTMLElement).style.fontStyle !== "normal" && null,
			},
			{ style: "font-style=italic" },
		]
	},
	renderHTML() { return ["em", 0] },
})

export const Strong = Mark.create({
	name: "strong",
	parseHTML() {
		return	[
			{ tag: "strong" },
			{
				tag: "b",
				getAttrs: node => (node as HTMLElement).style.fontWeight !== "normal" && null,
			} satisfies ParseRule,
			{
				style: "font-weight",
				getAttrs: value => /^(bold(er)?|[5-9]\d{2,})$/.test(value as string) && null,
			} satisfies ParseRule,
		]
	},
	renderHTML() { return ["strong", { style: "font-weight: bold" }, 0] },

})
const extensions = [
	Document,
	Dummy,
	List,
	Item,
	Paragraph,
	Text,
	HardBreak,
	Heading,
	Image,
	Em,
	Strong,
	History,
	Extension.create({
		addProseMirrorPlugins() {
			return [
				debugSelection(),
			]
		},
		addCommands() {
			return {
				backspace: rawCommands.backspace.create(),
				changeAttrs: rawCommands.changeAttrs.create(),
			}
		},

		addKeyboardShortcuts() {
			return {
				Backspace: () => {
					this.editor.commands.backspace()
					return true
				},
				[`Ctrl-Backspace`]: () => {
					this.editor.commands.deleteNodes()
					return true
				},
				[`Ctrl-z`]: () => this.editor.commands.undo(),

			}
		},
	}),
]
export const RootExtension = Extension.create<{}>({
	name: "root",
	addExtensions() {
		return extensions
	},
})
const _schema = getSchema(extensions)
export const schema = _schema

