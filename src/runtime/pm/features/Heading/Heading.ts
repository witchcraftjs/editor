import { isArray } from "@alanscodelog/utils/isArray"
import { keys } from "@alanscodelog/utils/keys"
import { mergeAttributes, Node, textblockTypeInputRule } from "@tiptap/core"

import { changeLevelAttr } from "./commands/changeLevelAttr.js"
import type { HeadingNodeOptions } from "./types.js"

declare module "@tiptap/core" {

	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		heading: {
			setHeading: (opts: {
				level: HeadingNodeOptions["levels"][number]
				onlyHeading: boolean
			}, pos?: number) => ReturnType
			toggleHeading: (opts: {
				level: HeadingNodeOptions["levels"][number]
			}) => ReturnType
		}
	}
}

/**
 * Like tiptap's Heading extension, but makes it easier to configure per-level html attributes.
 *
 * Also the setHeading command has an option to only change the heading level if the text is already a heading.
 *
 * This is useful for when you want to change the heading level of a heading that is already in the document.
 */

// am not just extending because that drag's in tiptap's heading commands interface
// and these commands have different signatures
// it's less painful to just re-write
// also might need to add heading ids/slugs in the future to make it possible to embed via headings

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Heading = Node.create<HeadingNodeOptions>({
	name: "heading" satisfies NodeHeadingName,
	content: "inline*",
	group: "block",
	defining: true,
	addOptions() {
		return {
			levels: [1, 2, 3, 4, 5, 6],
			HTMLAttributes: {
				class: [
					"text-xl",
					"text-2xl/normal",
					"text-3xl/normal",
					"text-4xl/normal",
					"text-5xl/normal",
					"text-6xl/normal"
				]
			}
		}
	},

	addAttributes() {
		return {
			level: {
				default: 1,
				rendered: false
			}
		}
	},
	parseHTML() {
		return this.options.levels
			.map((level: HeadingNodeOptions["levels"][number]) => ({
				tag: `h${level}`,
				attrs: { level }
			}))
	},

	// eslint-disable-next-line @typescript-eslint/naming-convention
	renderHTML({ HTMLAttributes, node }) {
		const level = this.options.levels.includes(node.attrs.level)
			? node.attrs.level
			: this.options.levels[0]

		// eslint-disable-next-line @typescript-eslint/naming-convention
		const thisFinalHTMLAttributes = { ...this.options.HTMLAttributes }
		for (const key of keys(thisFinalHTMLAttributes)) {
			if (isArray(thisFinalHTMLAttributes[key])) {
				thisFinalHTMLAttributes[key] = thisFinalHTMLAttributes[key][level - 1]
			}
		}
		return [
			`h${level}`,
			mergeAttributes(
				thisFinalHTMLAttributes,
				HTMLAttributes,
				{
					level
				}
			),
			0
		]
	},
	addCommands() {
		return {
			setHeading: changeLevelAttr({
				attributeKey: "level",
				nodeType: this.type.name,
				allowedValues: this.options.levels,
				toggleGroups: ["block"]
			}),
			toggleHeading: ({ level = 1 }: { level: number }) => ({ commands }) => {
				if (!this.options.levels.includes(level as any)) {
					return false
				}

				return commands.toggleNode(this.name, "paragraph", { level })
			}
		}
	},
	addInputRules() {
		// taken from tiptap-extension-heading
		return this.options.levels.map(level => textblockTypeInputRule({
			find: new RegExp(`^(#{1,${level}})\\s$`),
			type: this.type,
			getAttributes: {
				level
			}
		}))
	}

})

export type NodeHeadingName = "heading"
