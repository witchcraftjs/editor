import { crop } from "@alanscodelog/utils"
// this import registers all languages
import hljs from "highlight.js"
import fs from "node:fs"
import path from "node:path"

const list = Object.fromEntries(hljs.listLanguages()
	.map(lang => [
		lang,
		{
			aliases: hljs.getLanguage(lang).aliases
		}
	]))

if (list.length === 0) {
	throw new Error("No languages found, something is wrong with the import.")
}

const fileContents = crop`
/* eslint-disable */
import { keys } from "@alanscodelog/utils/keys"

/**
 * This is an auto-generated file.
 *
 * Do not edit manually.
 *
 * See build/utils/generateHighlightJsInfo.js
 */

type LanguageState = Record<string, { loaded: boolean, aliases: string[] }>

export type HighlightJsLanguageInfo = {
	languages: LanguageState
	aliases: Record<string, string>
}

const rawLanguages: Record<string, Partial<LanguageState[string]>> = ${JSON.stringify(list, null, "\t")}

for (const lang of (keys(rawLanguages as any))) {
	(rawLanguages as any)[lang].loaded = false
}


export const highlightJsLanaguages: HighlightJsLanguageInfo = {
	languages: rawLanguages as any,
	aliases: Object.fromEntries(
		(keys(rawLanguages)
			.map(lang =>
				[
					...(rawLanguages[lang].aliases?.map(alias => [alias,lang]) ?? []),
					[lang, lang]
				]
			))
			.flat()
	)
}
`
const dirPath = path.resolve(import.meta.dirname)
fs.writeFileSync(
	path.resolve(dirPath, "../highlightJsInfo.ts"),
	fileContents
)
