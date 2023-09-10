#!/usr/bin/env node

/**
 * This fixes all eslint problems, but only renames files that eslint comes across so there might still be some manual changes needed.
 */

import { ESLint } from "eslint"
import fs from "fs/promises"
import path from "path"


const eslint = new ESLint()
eslint.lintFiles(["{src,tests}/**/*.{js,ts}", "*.{js,ts}"])
	.then(async results => {
		const files = {}
		const variables = []
		for (const res of results) {
			for (const message of res.messages) {
				if (message.ruleId === "camelcase") {
					const match = message.message.match(/(?:')(.*?)(?:')/)[1]
					if (!variables.includes(match)) {
						variables.push(match)
					}
				}
			}
			const source = res.source
			if (source === undefined) continue
			files[res.filePath] = res.source
		}
		return Object.keys(files).map(async filepath => {
			let source = files[filepath]
			source = source.replace(new RegExp(variables.join("|"), "g"), match => convertToCamelCase(match))
			const parsed = path.parse(filepath)
			const name = parsed.name
			const isSpec = name.endsWith(".spec")
			const converted = convertToCamelCase(isSpec ? name.slice(0, name.indexOf(".spec")) : name) + (isSpec ? ".spec" : "")
			const newPath = path.format({ ...parsed, name: converted, base: converted + parsed.ext })
			// eslint-disable-next-line no-console
			console.log(newPath)

			if (newPath !== filepath) await fs.unlink(filepath)
			await fs.writeFile(newPath, source)
		})
	})
function convertToCamelCase(str) {
	return str.replace(/^(_*?(?=[a-z])[a-zA-Z0-9]+?)((_[a-zA-Z0-9]+?)+?)$/, (_variable, start, end) => {
		const v = start.toLowerCase() + end.replace(/_([a-zA-Z0-9])/g, (_match, letter) =>
			letter.toUpperCase(),
		)
		return v
	})
}
