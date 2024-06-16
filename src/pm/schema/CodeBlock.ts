import { castType } from "@alanscodelog/utils"
import { mergeAttributes, Node } from "@tiptap/core"

import type { HTMLAttributesOptions } from "../../types.js"
import { rawCommands } from "../commands/index.js"

// eslint-disable-next-line @typescript-eslint/naming-convention
export const CodeBlock = Node.create<HTMLAttributesOptions>({
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
				if (lang) { return { language: lang } }
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

