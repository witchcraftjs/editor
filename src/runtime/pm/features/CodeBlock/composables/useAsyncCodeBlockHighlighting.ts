import { keys } from "@alanscodelog/utils/keys"
import { pushIfNotIn } from "@alanscodelog/utils/pushIfNotIn"
import type { Editor, Editor as PmEditor } from "@tiptap/core"
import type { Transaction } from "@tiptap/pm/state"
import type { createLowlight } from "lowlight"
import { provide, type Ref, ref, type ShallowRef, watch } from "vue"

import { highlightJsLanaguages, type HighlightJsLanguageInfo } from "../highlightJsInfo.js"
import { langsInfoInjectionKey } from "../types.js"

let langModulesDirectory = "../../../../../../../../highlight.js/es/languages"
// see https://github.com/vitejs/vite/issues/14102
// doing it directly for now to avoid build issues
// in the future we might be able to import diretly
let langModules = import.meta.glob("../../../../../../../../highlight.js/es/languages/*.js", { import: "default" })

const fallback = import.meta.glob("../../../../../../node_modules/highlight.js/es/languages/*.js", { import: "default" })
if (keys(langModules).length === 0 && keys(fallback).length !== 0) {
	langModules = fallback
	langModulesDirectory = "../../../../../../node_modules/highlight.js/es/languages"
	// eslint-disable-next-line no-console
	console.warn("Using fallback highlight.js languages locations. This should not be happening unless developing the library locally from it's playground using the linked module.")
}
if (keys(langModules).length === 0) {
	// eslint-disable-next-line no-console
	console.warn("Could not find any highlight.js languages. This is probably an issue with the editor package. Please report it.")
}

function defaultOnError(e: any): void {
	// eslint-disable-next-line no-console
	console.log(e)
}
/**
	* Listens for transactions and scans the document, dynamically loading the used highlight.js language themes.
	*
	* Automatically provides them using {@link langsInfoInjectionKey}.
	*
	* Allows passing additional themes via the additionalThemes prop.
	*
	* You should not need to use them directly, but returns the functions used to load, lazy load, and query the editor, and also the provided langsInfo.
	*
	*/
export function useAsyncCodeBlockHighlighting(
	{
		lowlightInstance,
		editor: editorRef,
		onError = defaultOnError,
		debug = false
	}: {
		lowlightInstance: ReturnType<typeof createLowlight>
		editor: ShallowRef<Editor | undefined>
		onError?: ((e: any) => void)
		debug?: boolean
	}): {
	loadLang: (lang: string) => Promise<string | Error>
	lazyLoadCodeBlockLangs: ({ editor }: { editor: PmEditor }) => Promise<void>
	getLangListFromEditor: (editor: PmEditor) => string[]
	/** All importable highlight.js languages. */
	langsInfo: Ref<HighlightJsLanguageInfo>
} {
	const allLangs = ref<HighlightJsLanguageInfo>(highlightJsLanaguages)
	if (debug) {
		// eslint-disable-next-line no-console
		console.log({ langModulesDirectory, langModules, allLangs })
	}
	provide(langsInfoInjectionKey, allLangs)

	/**
	 * Load a language. Can return an error.
	 *
	 * Does not throw because even when using promise.allSettled it trigger's chrome's uncaught exception and is very annoying.
	 */
	async function loadLang(lang: string): Promise<string | Error> {
		if (lowlightInstance.registered(lang)) {
			// eslint-disable-next-line no-console
			if (debug) { console.log(`Already registered: ${lang}`) }
			const error = new Error(`Already registered: ${lang}`)
			;(error as any).code = "ALREADY_REGISTERED"
			return error
		}
		if (allLangs.value.aliases[lang] === undefined) {
			// eslint-disable-next-line no-console
			if (debug) { console.error(`Unknown language or alias: ${lang}`) }

			return new Error(`Unknown language or alias: ${lang}`)
		}
		const fullName = allLangs.value.aliases[lang]
		const langLoadingKey = `${langModulesDirectory}/${fullName}.js`
		const func = langModules[langLoadingKey]
		if (func === undefined) {
			return new Error(`Could not find language: ${langLoadingKey} in ${langModulesDirectory}. Valid paths are:\n${keys(langModules).join(",\n")}`)
		}
		const hljs = await func()
		lowlightInstance.register(lang, hljs as any)
		return lang
	}

	function getLangListFromEditor(editor: PmEditor): string[] {
		const langs: string[] = []
		const doc = editor.state.doc
		editor.state.doc.nodesBetween(0, doc.nodeSize - 2, (node, pos) => {
			if (node.type?.name === "codeBlock") {
				const lang = node.attrs?.language
				const loading = node.attrs.loading
				if (debug) {
					// eslint-disable-next-line no-console
					console.log(`Looked at node at pos ${pos} (lang: ${lang}, loading: ${loading}).`)
				}
				if (lang && loading) {
					// eslint-disable-next-line no-console
					if (debug) { console.log(`Found node at pos ${pos}.`) }
					pushIfNotIn(langs, [lang])
				}
				return false
			}
			return true
		})
		return langs
	}

	async function lazyLoadCodeBlocks({ editor, transaction }: { editor: PmEditor, transaction?: Transaction }): Promise<void> {
		if (debug) {
			// eslint-disable-next-line no-console
			console.log(`lazyLoadCodeBlocks called, docChanged: ${transaction?.docChanged}.`)
		}
		if (!transaction?.docChanged) return
		const tr = editor.state.tr
		const langs = getLangListFromEditor(editor)
		const loadableLangs = (await Promise.allSettled(langs.map(loadLang)))
			.filter(_ => {
				if (_.status === "rejected") {
					onError(_.reason)
				}
				return _.status === "fulfilled" && !((_ as any).value instanceof Error)
			})
			.map(_ => (_ as any).value)
		if (debug) {
			// eslint-disable-next-line no-console
			console.log(`Found ${loadableLangs.length} loadable languages. \n\t${loadableLangs.join("\n\t")}`)
		}

		editor.state.doc.nodesBetween(0, editor.state.doc.resolve(0).end(), (node, pos) => {
			if (node.type?.name === "codeBlock") {
				const langAttr = node.attrs?.language
				const loading = node.attrs.loading
				if (langAttr && loading && loadableLangs.includes(langAttr)) {
					// eslint-disable-next-line no-console
					if (debug) { console.log(`Set node at pos ${pos} as loaded.`) }
					tr.setNodeMarkup(pos, undefined, {
						...node.attrs,
						language: langAttr,
						loading: false
					})
				}
				return false
			}
			return true
		})
		if (debug) {
			// eslint-disable-next-line no-console
			console.log(`tr.docChanged: ${tr.docChanged}.`)
		}
		if (tr.docChanged) {
			editor.view.dispatch(tr)
		}
	}

	watch(editorRef, () => {
		if (editorRef.value) {
			editorRef.value.on("transaction", lazyLoadCodeBlocks)
		} else {
			editorRef.value!.off("transaction", lazyLoadCodeBlocks)
		}
	})
	if (editorRef.value) {
		editorRef.value.on("transaction", lazyLoadCodeBlocks)
	}

	return {
		loadLang,
		lazyLoadCodeBlockLangs: lazyLoadCodeBlocks,
		getLangListFromEditor,
		langsInfo: allLangs
	}
}
