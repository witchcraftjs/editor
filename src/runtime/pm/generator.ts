import { faker } from "@faker-js/faker"
import type { Mark, Node } from "@tiptap/pm/model"
import { nanoid } from "nanoid"
import { builders } from "prosemirror-test-builder"

import { schema } from "./schema.js"

export const pm = builders(schema)

export type GeneratorConfigEntry<
	TChildrenType extends "node" | "text" = "node" | "text",
	TParentType extends "node" | "text" = "node" | "text",
	TChildren extends TChildrenType extends "node" ? Node : Mark | string = TChildrenType extends "node" ? Node : Mark | string,
	TParent extends TParentType extends "node" ? Node : Mark | string = TParentType extends "node" ? Node : Mark | string
> = {
	parents: {
		/**
		 * The type of the parent (node or "text") where "text" is a string or mark.
		 * Determines the call signature of the create function.
		 */
		type: TParentType
		/** Possible parent nodes that can have the given children. The children need not be direct descendants, see `ignoreValidation`. */
		names: string[]
	}
	children: {
		/**
		 * The type of children (node or "text") where "text" is a string or mark.
		 * Determines the call signature of the create function.
		 */
		type: TChildrenType
		/* Children types to generate. */
		names?: string[]
	}
	/**
	 * Set to true to ignore all children mismatches, or set an array of children names to ignore.
	 *
	 * This is needed for creating "end" nodes that aren't valid names (e.g. `text` is not technically allowed since you can't do `builder.text()`).
	 *
	 * Or when the children are not direct children of the parent types as there is some in-between wrapper node that needs to be generated.
	 */
	ignoreValidation?: boolean | string[]
	/* Whether the parent listed is the root node. */
	isRoot?: boolean
	/**
	 * Creates the node. Can return undefined to "terminate" the branch being created, the node will be filtered out of the nodes passed to it's parent.
	 *
	 * If not set, a default `builder[parentType]({}, ...children)` will be used.
	 *
	 * Note also, it is not required to use the children. You can ignore them or use a subset or create a different one if needed (some node types *require* text and if your text not can return "" this can be a problem).
	 */
	create?: (parent: string, children: TChildren[]) => TParent | undefined
}

export function getTextOrMarkLength(textOrMark: string | Mark) {
	if (typeof textOrMark === "string") {
		return textOrMark.length
	}
	const textNodes = (textOrMark as any).flat.map((_: any) => "text" in _ ? _.text.length : getTextOrMarkLength(_ as any)) as number[]
	return textNodes.reduce((a, b) => a + b, 0)
}

export function createGeneratorConfig<
	TChildrenType extends "node" | "text" = "node" | "text",
	TParentType extends "node" | "text" = "node" | "text",
	TChildren extends TChildrenType extends "node" ? Node : Mark | string = TChildrenType extends "node" ? Node : Mark | string,
	TParent extends TParentType extends "node" ? Node : Mark | string = TParentType extends "node" ? Node : Mark | string
>(
	config: GeneratorConfigEntry<TChildrenType, TParentType, TChildren, TParent>
): GeneratorConfigEntry<TChildrenType, TParentType, TChildren, TParent> {
	return config
}

function createPsuedoSentence() {
	// sentence generated with string.sample (which contains all possible chars) instead of lorem.sentence
	const sentenceLength = faker.number.int({ min: 0, max: 1000 })
	const sentence = Array.from(
		{ length: sentenceLength },
		() => faker.string.sample({ min: 0, max: 1000 })
	).join(" ")
	return sentence
}

export const generatorConfig = [
	createGeneratorConfig({
		isRoot: true,
		parents: { type: "node", names: ["doc"] },
		ignoreValidation: true,
		children: { type: "node", names: ["item"] },
		create: (_parent, children) => {
			if (!children || children.length === 0) {
				return pm.doc(pm.list(pm.item({ blockId: nanoid(10) }, pm.paragraph({}, ""))))
			}
			return pm.doc(pm.list(...children))
		}
	}),
	createGeneratorConfig({
		parents: { type: "node", names: ["list"] },
		children: { type: "node", names: ["item"] },
		create: (_parent, children) => {
			if (!children || children.length === 0) {
				return pm.list(pm.item({ blockId: nanoid(10) }, pm.paragraph("")))
			}
			return pm.list(...children)
		}
	}),
	createGeneratorConfig({
		parents: { type: "node", names: ["item"] },
		children: { type: "node", names: [
			"paragraph",
			"heading",
			"codeBlock",
			"embeddedDoc",
			"iframe",
			"table",
			"image",
			"blockquote"
		] },
		create: (_parent, children) => {
			if (!children || children.length === 0) {
				return pm.item({ blockId: nanoid(10) }, pm.paragraph(""))
			}
			return pm.item(
				{ blockId: nanoid(10) },
				children[0]!,
				...(children.length > 1
					? [pm.list({},
							...children.slice(1).map(_ =>
								pm.item({ blockId: nanoid(10) }, _)
							)
						)]
					: []
				) as any
			)
		}
	}),
	createGeneratorConfig({
		parents: { type: "node", names: ["blockquote"] },
		children: { type: "node", names: ["paragraph", "cite"] },
		create: (_parent, children) => {
			const parTypes = []
			const citeTypes = []
			for (const child of children) {
				if (child.type.name === "cite") {
					citeTypes.push(child)
				} else {
					parTypes.push(child)
				}
			}
			if (parTypes.length === 0) {
				return pm.blockquote({}, pm.paragraph(""))
			} else {
				const someCite = citeTypes.find(_ => _.textContent.length > 0) ?? pm.cite({}, createPsuedoSentence())
				return pm.blockquote({}, ...parTypes, someCite)
			}
		}
	}),
	createGeneratorConfig({
		parents: { type: "node", names: ["table"] },
		children: { type: "node", names: [
			"tableHeader",
			"tableCell"
		] },
		ignoreValidation: true, // we're handling the in-between tableRow nodes
		create: (_parent, children) => {
			const headerType = []
			const cellType = []

			for (const child of children) {
				if (child.type.name === "tableHeader") {
					headerType.push(child)
				} else if (child.type.name === "tableCell") {
					cellType.push(child)
				}
			}
			const colNum = headerType.length

			if (colNum === 0) {
				return pm.table({}, pm.tableRow({}, pm.tableCell(pm.paragraph(""))))
			}
			const rowCount = Math.ceil(cellType.length / colNum)
			const rows: Node[] = []
			for (let i = 0; i < rowCount; i++) {
				rows.push(pm.tableRow({}, ...cellType.slice(i * colNum, (i + 1) * colNum)))
			}

			return pm.table({}, pm.tableRow({}, ...headerType), ...rows)
		}
	}),
	createGeneratorConfig({
		parents: { type: "node", names: ["tableHeader", "tableCell"] },
		children: { type: "node", names: ["paragraph"] },
		create: (_parent, children) => {
			if (!children || children.length === 0) {
				return pm.tableCell(pm.paragraph(""))
			}
			return pm.tableCell(...children.slice(0, 1))
		}
	}),
	createGeneratorConfig({
		parents: { type: "node", names: ["paragraph", "heading", "codeBlock", "cite", "heading"] },
		children: { type: "text", names: [
			"bold",
			"italic",
			"underline",
			"strike",
			"subscript",
			"superscript",
			"code",
			"link"
		] },
		create(parent, children) {
			if (parent === "heading") {
				return pm[parent]({ level: 1 }, ...children as any)
			}
			if (parent === "cite") {
				// citation must have SOME text
				return pm[parent]({}, faker.lorem.sentence())
			}
			if (parent === "paragraph") {
				const someIndex = faker.number.int({ min: 0, max: children.length })
				children.splice(someIndex, 0, pm.hardBreak() as any)
			}

			return pm[parent]({}, ...children as any)
		}
	}),
	createGeneratorConfig({
		parents: { type: "text", names: [
			"bold",
			"italic",
			"underline",
			"strike",
			"subscript",
			"superscript",
			"link"
		]
		},
		// note the addition of text
		children: { type: "text", names: [
			"bold",
			"italic",
			"underline",
			"strike",
			"subscript",
			"superscript",
			"link",
			"text"
		] },
		ignoreValidation: ["text"] // text is not a real node
		// create: (parent, children) => {
		// 	return pm[parent]({}, ...children as any) as any
		// }
	}),
	createGeneratorConfig({
		ignoreValidation: true, // text is not a real node
		parents: { type: "text", names: ["code"] },
		children: { type: "text", names: ["text"] }
	}),
	createGeneratorConfig({
		parents: { type: "text", names: ["text"] },
		children: { type: "text" },
		create: _parent => {
			return createPsuedoSentence()
		}
	})
]
