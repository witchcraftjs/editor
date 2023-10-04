/* eslint-disable @typescript-eslint/naming-convention */
import { castType, keys } from "@alanscodelog/utils"
import { Extension, getSchema, Mark, mergeAttributes, Node } from "@tiptap/core"
import { History } from "@tiptap/extension-history"
import { VueNodeViewRenderer } from "@tiptap/vue-3"
import { type ParseRule } from "prosemirror-model"
import { Plugin } from "prosemirror-state"
import { Decoration, DecorationSet } from "prosemirror-view"

import { type StatefulNodeStates, statefulStates } from "./stateful.js"

import ItemNodeView from "../components/ItemNodeView.vue"
import { rawCommands } from "../core/commands.js"
import { debugSelection } from "../plugins/debugSelection.js"
import { debugNode } from "../utils/internal/debugNode.js"


type HTMLAttributesOptions = {
	HTMLAttributes: Record<string, any>
}

export const Document = Node.create({
	name: "doc",
	topNode: true,
	content: "list*",
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
	renderHTML({ HTMLAttributes: attrs }) {
		return [
			"div",
			mergeAttributes(
				this.options.HTMLAttributes,
				{
					"node-type": attrs.type,
					role: "list",
				},
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
	renderHTML({ HTMLAttributes: attrs, node }) {
		return [
			"div",
			mergeAttributes(
				this.options.HTMLAttributes,
				{
					"node-type": attrs.type,
					"node-state": attrs.state,
					"node-hide-children": attrs.hideChildren,
				},
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
			deleteNodes: rawCommands.deleteNodes.create(),
			indentListItem: rawCommands.indentListItem.create("item"),
			unindentListItem: rawCommands.unindentListItem.create("item"),

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

export const Text = Node.create({
	name: "text",
	group: "inline",
})

export const Paragraph = Node.create<HTMLAttributesOptions>({
	name: "paragraph",
	group: "block",
	// draggable: false,
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
	// selectable: false,
	renderHTML() { return ["br"] },
	parseHTML() { return [{ tag: "br" }] },
})

export const Heading = Node.create<HTMLAttributesOptions & {
	levels: number[]
}>({
	name: "heading",
	group: "block",
	content: "inline*",
	// draggable: false,
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
	
})
export const CodeBlock = Node.create<HTMLAttributesOptions >({
	name: "code",
	group: "block",
	marks: "",
	content: "text*",
	code: true,
	defining: true,
	// draggable: false,
	addOptions() {
		return {
			HTMLAttributes: {},
		}
	},
	addAttributes() {
		return {
			language: {
				default: "",
				rendered: false,
			},
		}
	},
	parseHTML() {
		return [{
			tag: "pre",
			preserveWhitespace: "full",
			getAttrs: node => {
				castType<HTMLElement>(node)
				let lang = node.getAttribute("language") ?? undefined
				lang ||= Array.from(node.classList).find(c => c.startsWith("language-"))?.slice("language-".length)
				if (lang) {return { language: lang }}
				// allow no language to also match
				return null
			},
		}]
	},
	// eslint-disable-next-line @typescript-eslint/typedef
	renderHTML({ HTMLAttributes: attrs }) {
		return [
			`pre`,
			mergeAttributes(this.options.HTMLAttributes, attrs),
			[
				"code",
				0,
			],
		]
	},
	addCommands() {
		return {
			toggleCodeBlock: rawCommands.toggleCodeBlock.create(),
		}
	},
})


export const Image = Node.create<HTMLAttributesOptions & {
}>({
	name: "image",
	group: "inline",
	inline: true,
	// draggable: false,
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
export const Italic = Mark.create({
	name: "italic",
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

export const Bold = Mark.create({
	name: "bold",
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

export const Code = Mark.create({
	name: "inline-code",
	parseHTML() {
		return	[
			{ tag: "code" },
		]
	},
	renderHTML() { return ["code", 0] },
})

const extensions = [
	Document,
	List,
	Item,
	Paragraph,
	Text,
	HardBreak,
	CodeBlock,
	Heading,
	Image,
	Italic,
	Bold,
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
				copyOrMoveListItem: rawCommands.copyOrMoveListItem.create(),
				toggleBold: rawCommands.toggleBold.create(),
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

