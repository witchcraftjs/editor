import { keys } from "@alanscodelog/utils/keys"
import { describe, expect, it } from "vitest"

import { isPartiallyEqual } from "./utils/isPartiallyEqual.js"
import { pm } from "./utils/pm.js"
import { setupWrapper } from "./utils/setupWrapper.js"

import { defaultColors } from "../src/runtime/pm/features/Highlight/Highlight.js"

describe("Parsing", () => {
	describe("highlights", () => {
		async function parsersHighlightSet(attributes: string[], expected: ({ color: string })[]) {
			const { c, editor }	=	await setupWrapper(`
			<ul>
				${attributes.map(a => `<li blockid="0"><p><mark ${a}>Text</mark></p></li>`).join("\n")}
			</ul>
		`)
			expect(isPartiallyEqual(editor.state.doc.toJSON(), pm.doc(pm.list(
				...expected.map(attrs => pm.itemNoId(pm.paragraph(pm.highlight(attrs, "Text"))))
			)).toJSON())).to.equal(true)
		}
		it("style='background-color: color'", async () => {
			await parsersHighlightSet(
				keys(defaultColors).map(k => `style="background-color: ${defaultColors[k].color}"`),
				keys(defaultColors).map(k => ({ color: k }))
			)
		})
		it("style='background-color: color' and data-color=name", async () => {
			await Promise.all(
				Array(defaultColors.slot1.matches.length)
					.map(async (_, i) => {
						await parsersHighlightSet(
							keys(defaultColors).map(k => `style="background-color: ${defaultColors[k].matches[i]}"`),
							keys(defaultColors).map(k => ({ color: k }))
						)
					})
			)
		})
	})
})
