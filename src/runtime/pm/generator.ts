import { faker } from "@faker-js/faker"
import type { Node } from "@tiptap/pm/model"
import { nanoid } from "nanoid"
import { builders } from "prosemirror-test-builder"

import { schema } from "./schema.js"

export const pm = builders(schema)

import { highlightJsLanaguages } from "./features/CodeBlock/highlightJsInfo.js"
import { createGeneratorConfig } from "./utils/generator/createGeneratorConfig.js"
import { createPsuedoSentence } from "./utils/generator/createPsuedoSentence.js"
import { createRandomChildCountGenerator } from "./utils/generator/createRandomChildCountGenerator.js"
import { sometimesZero } from "./utils/generator/sometimesZero.js"

export const generatorConfig = [
	createGeneratorConfig({
		parents: { type: "node", names: ["doc"] },
		children: {
			type: "node",
			names: [["item", 1]]
		},
		count: createRandomChildCountGenerator({ max: 50, zeroChance: 0 }),
		create: (pm, _parent, children) => {
			if (!children || children.length === 0) {
				return pm.doc(pm.list(pm.item({ blockId: nanoid(10) }, pm.paragraph({}, ""))))
			}
			return pm.doc(pm.list(...children))
		}
	}),
	createGeneratorConfig({
		parents: { type: "node", names: ["list", "doc"] },
		children: { type: "node", names: [
			["item", 1]
		] },
		count: createRandomChildCountGenerator({ max: 30 }),
		create: (pm, _parent, children) => {
			if (!children || children.length === 0) {
				return pm.list(pm.item({ blockId: nanoid(10) }, pm.paragraph("")))
			}
			return pm.list(...children)
		}
	}),
	createGeneratorConfig({
		parents: { type: "node" as const, names: ["item"] },
		children: { type: "node" as const, names: [
			["paragraph", 14],
			["heading", 4],
			["codeBlock", 2],
			["table", 2],
			["image", 3],
			["blockquote", 4],
			["embeddedDoc", 1],
			["iframe", 1]
		] },
		count: createRandomChildCountGenerator({ max: 20, depthInfluence: 0.5 }),
		create: (pm, _parent, children) => {
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
		children: { type: "node", names: [
			["paragraph", 1],
			["cite", 1]
		] },
		count: () => faker.number.int({ min: 1, max: 2 }),
		create: (pm, _parent, children) => {
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
				const someCite = citeTypes.find(_ => _.textContent.length > 0) ?? pm.cite({}, createPsuedoSentence({ min: 1 }))
				return pm.blockquote({}, ...parTypes, someCite)
			}
		}
	}),
	createGeneratorConfig({
		parents: { type: "node", names: ["table"] },
		children: { type: "node", names: [
			["tableCell", 1]
		] },
		count: createRandomChildCountGenerator({ max: 50, depthInfluence: 0.5, zeroChance: 0 }),
		create: (pm, _parent, children) => {
			const colNum = faker.number.int({ min: 1, max: Math.min(children.length, 10) })
			const rowCount = Math.floor(children.length / colNum)
			const rows: Node[] = []
			const addHeader = faker.datatype.boolean()
			if (addHeader) {
				const nodes = Array.from(
					{ length: colNum },
					() => pm.tableHeader({}, pm.paragraph({}, createPsuedoSentence({ min: 1 })))
				)
				rows.push(pm.tableRow({}, ...nodes))
			}
			for (let i = 0; i < rowCount; i++) {
				const rowChildren = children.slice(i * colNum, (i + 1) * colNum)
				if (rowChildren.length === 0) continue
				rows.push(pm.tableRow({}, ...rowChildren))
			}

			if (rows.length === 0) return undefined
			return pm.table({}, ...rows)
		}
	}),
	createGeneratorConfig({
		parents: { type: "node", names: ["tableCell"] },
		children: { type: "node", names: [
			["paragraph", 1]
		] },
		count: () => sometimesZero(1),
		create: (pm, _parent, children) => {
			if (!children || children.length === 0) {
				return pm.tableCell(pm.paragraph(""))
			}
			return pm.tableCell(...children.slice(0, 1))
		}
	}),

	createGeneratorConfig({
		parents: { type: "text", names: ["paragraph", "heading", "codeBlock", "cite", "heading"] },
		children: { type: "text", names: [
			["bold", 1],
			["italic", 1],
			["underline", 1],
			["strike", 1],
			["subscript", 1],
			["superscript", 1],
			["code", 1],
			["link", 1],
			["text", 10]
		] },
		count: createRandomChildCountGenerator({ max: 5, depthInfluence: 0.2 }),
		create(pm, parent, children) {
			if (parent === "heading") {
				return pm[parent]({ level: faker.number.int({ min: 1, max: 6 }) }, ...children as any)
			}
			if (parent === "cite") {
				// citation must have SOME text
				return pm[parent]({}, faker.lorem.sentence())
			}
			if (parent === "paragraph") {
				const someIndex = faker.number.int({ min: 0, max: children.length })
				children.splice(someIndex, 0, pm.hardBreak() as any)
			}
			if (parent === "codeBlock") {
				// aliases contains both the names and the aliases
				const lang = faker.helpers.arrayElement([...Object.keys(highlightJsLanaguages.aliases), undefined])
				const lines = faker.number.int({ min: 1, max: 10 })
				const code = Array.from(
					{ length: lines },
					() => createPsuedoSentence()
				).join("\n")
				return pm[parent]({ language: lang }, code)
			}

			return pm[parent]({}, ...children as any) as any
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
		skipChild(parentType, childType, depth) {
			if (depth > 20) return true
			return parentType === childType
		},
		children: { type: "text", names: [
			["bold", 1],
			["italic", 1],
			["underline", 1],
			["strike", 1],
			["subscript", 1],
			["superscript", 1],
			["link", 1],
			["text", 10]
		] },
		count: createRandomChildCountGenerator({ max: 5, depthInfluence: 0.7 }),
		create: (pm, parent, children) => {
			return pm[parent]({}, ...children as any) as any
		}
	}),
	createGeneratorConfig({
		parents: { type: "text", names: ["text"] },
		create: () => {
			return createPsuedoSentence()
		}
	})
]

