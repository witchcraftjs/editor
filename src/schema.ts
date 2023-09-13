/* eslint-disable @typescript-eslint/naming-convention */
import { pick } from "@alanscodelog/utils"
import { castType } from "@alanscodelog/utils"
import { Extension, getSchema, Mark, mergeAttributes, Node } from "@tiptap/core"
import { VueNodeViewRenderer } from "@tiptap/vue-3"
import { type Attrs, type ParseRule, Schema } from "prosemirror-model"

import ItemNodeView from "./components/ItemNodeView.vue"

 
// export const schema = new Schema({
// 	nodes: {
// 		dummy: {
// 			content: "(item|block)*",
// 			priority: 0,
// 		},
// 		doc: {
// 			content: "item*",
// 		},
// 		item: {
// 			attrs: {
// 				level: { default: 0 },
// 			},
// 			draggable: false,
// 			content: "block",
// 			parseDOM: [{
// 				tag: "div",
// 				// getAttrs,
// 			}],
// 			toDOM: node => [
// 				"div",
// 				{
// 					class: "item",
// 					level: node.attrs.level.toString(),
// 				},
// 				0,
// 			],
// 			defining: false,
// 		},
// 		paragraph: {
// 			group: "block",
// 			attrs: {
// 				temp: { default: undefined },
// 			},
// 			draggable: false,
// 			content: "inline*",
// 			parseDOM: [{ tag: "p" }],
// 			toDOM: () => ["p", 0],
// 		},
// 		heading: {
// 			group: "block",
// 			draggable: false,
// 			content: "inline*",
// 			parseDOM: [{ tag: "h1" }],
// 			toDOM: () => ["h1", 0],
// 		},
// 		text: {
// 			group: "inline",
// 		},
// 		image: {
// 			inline: true,
// 			group: "inline",
// 			attrs: {
// 				src: { default: "" },
// 			},
// 			draggable: false,
// 			parseDOM: [{ tag: "img", getAttrs: dom => ({ src: (dom as HTMLImageElement).src }) }],
// 			toDOM: node => ["img", { src: node.attrs.src }, 0],
// 		},
// 		// todo
// 		// eslint-disable-next-line camelcase
// 		hard_break: {
// 			inline: true,
// 			group: "inline",
// 			selectable: false,
// 			parseDOM: [{ tag: "br" }],
// 			toDOM: () => ["br"],
// 		},
// 	},
// 	marks: {
// 		em: {
// 			parseDOM: [{ tag: "i" }, { tag: "em" }, { style: "font-style=italic" }],
// 			toDOM() { return ["em", 0] },
// 		},
// 		strong: {
// 			parseDOM: [
// 				{ tag: "strong" },
// 				{
// 					tag: "b",
// 					getAttrs: node => typeof node !== "string"
// 						? (node as HTMLElement)?.style.fontWeight !== "normal"
// 							? null
// 							: false
// 						: false,
// 				},
// 				{
// 					style: "font-weight",
// 					getAttrs: node => typeof node === "string"
// 						? /^(bold(er)?|[5-9]\d{2,})$/.test(node)
// 							? null
// 							: false
// 						: false,
// 				},
// 			],
// 			toDOM() { return ["strong", 0] },
// 		},
// 	},
// })
type HTMLAttributesOptions = {
	HTMLAttributes: Record<string, any>
}

export const Document = Node.create({
	name: "doc",
	topNode: true,
	content: "item*",
})
export const Dummy = Node.create({
	name: "dummy",
	content: "(item|block)*",
	priority: 0,
})

export const Item = Node.create<HTMLAttributesOptions>({
	name: "item",
	draggable: false,
	content: "block",
	defining: false,
	addOptions() {
		return { HTMLAttributes: {} }
	},
	addAttributes() {
		return {
			level: {
				default: 0,
			},
		}
	},
	parseHTML() {
		return	[{
			tag: "div",
			getAttrs: dom => {
				// https://prosemirror.net/docs/ref/#model.ParseRule.getAttrs
				// It is always called with an HTML element for tag rules
				castType<HTMLElement>(dom)
				return {
					level: parseInt(dom.getAttribute("level") ?? "0", 10),
				}
			}
			,
		}]
	},

	// eslint-disable-next-line @typescript-eslint/typedef
	renderHTML({ HTMLAttributes, node }) {
		return [
			"div",
			mergeAttributes(
				this.options.HTMLAttributes,
				{
					level: node.attrs.level,
				},
				HTMLAttributes
			),
			0,
		]
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
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
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
			"text-6xl",
			"text-5xl",
			"text-4xl",
			"text-3xl",
			"text-2xl",
			"text-xl",
		]

		return [
			`h${level}`,
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
				class: classMap[level - 1],
				level,
			}),
			0,
		]
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
	Item,
	Paragraph,
	Text,
	HardBreak,
	Heading,
	Image,
	Em,
	Strong,
]
export const RootExtension = Extension.create<{}>({
	name: "root",
	addExtensions() {
		return extensions
	},
})
const _schema = getSchema(extensions)
export const schema = _schema
//
// type ParametersExceptFirst<F> =
// F extends (arg0: any, ...rest: infer R) => any ? R : never
// const fromEntries = <
//   const T extends ReadonlyArray<readonly [PropertyKey, unknown]>
// >(
//   entries: T
// ): { [K in T[number] as K[0]]: K[1] } => {
//   return Object.fromEntries(entries) as { [K in T[number] as K[0]]: K[1] };
// };
//
// // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
// export function simpleBuilders() {
// 	const raw = builders(_schema)
// 	const p = raw.paragraph
// 	const headings = ([1, 2, 3, 4, 5, 6] as const).map(level =>
// 		// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
// 		[`h${level}` as const, (...args: ParametersExceptFirst<typeof raw.heading>) => raw.heading({ level }, ...args)]
// 	)
// 	const heading = fromEntries(headings)
// 	const items = ([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const).map(level =>
// 		// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
// 		[`item${level}` as const, (...args: ParametersExceptFirst<typeof raw.heading>) => raw.item({ level }, ...args)]
// 	)
// 	const item = fromEntries(items)
//
// 	const res= {
// 		...pick(raw, ["doc", "dummy", "text", "hardBreak", "image"]),
// 		p,
// 		...heading,
// 		...item,
// 	}
// }
