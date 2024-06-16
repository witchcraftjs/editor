import { Schema } from "prosemirror-model"

// eslint-disable-next-line @typescript-eslint/naming-convention
const getAttrs = (dom: string | Node): Record<string, any> | null | undefined => ({

	class: (dom as Element).getAttribute("class") ?? "",
	level: parseInt((dom as Element).getAttribute("level") ?? "0", 10),
})

export const schema = new Schema({
	nodes: {
		dummy: {
			content: "(item|block)*",
			priority: 0,
		},
		doc: {
			content: "item*",
		},
		item: {
			attrs: {
				level: { default: 0 },
			},
			draggable: false,
			content: "block",
			parseDOM: [{
				tag: "div",
				getAttrs,
			}],
			toDOM: node => [
				"div",
				{
					class: "item",
					level: node.attrs.level.toString(),
				},
				0,
			],
			defining: false,
		},
		paragraph: {
			group: "block",
			attrs: {
				temp: { default: undefined },
			},
			draggable: false,
			content: "inline*",
			parseDOM: [{ tag: "p" }],
			toDOM: () => ["p", 0],
		},
		heading: {
			group: "block",
			draggable: false,
			content: "inline*",
			parseDOM: [{ tag: "h1" }],
			toDOM: () => ["h1", 0],
		},
		text: {
			group: "inline",
		},
		image: {
			inline: true,
			group: "inline",
			attrs: {
				src: { default: "" },
			},
			draggable: false,
			parseDOM: [{ tag: "img", getAttrs: dom => ({ src: (dom as HTMLImageElement).src }) }],
			toDOM: node => ["img", { src: node.attrs.src }, 0],
		},
		hard_break: {
			inline: true,
			group: "inline",
			selectable: false,
			parseDOM: [{ tag: "br" }],
			toDOM: () => ["br"],
		},
	},
	marks: {
		em: {
			parseDOM: [{ tag: "i" }, { tag: "em" }, { style: "font-style=italic" }],
			toDOM() { return ["em", 0] },
		},
		strong: {
			parseDOM: [
				{ tag: "strong" },
				{
					tag: "b",
					getAttrs: node => typeof node !== "string"
						? (node as HTMLElement)?.style.fontWeight !== "normal"
							? null
							: false
						: false,
				},
				{
					style: "font-weight",
					getAttrs: node => typeof node === "string"
						? /^(bold(er)?|[5-9]\d{2,})$/.test(node)
							? null
							: false
						: false,
				},
			],
			toDOM() { return ["strong", 0] },
		},
	},
})

