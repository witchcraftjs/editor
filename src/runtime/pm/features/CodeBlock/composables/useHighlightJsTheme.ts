import { crop } from "@alanscodelog/utils/crop"
import { dedupe } from "@alanscodelog/utils/dedupe"
import { indent } from "@alanscodelog/utils/indent"
import { isWhitespace } from "@alanscodelog/utils/isWhitespace"
import { keys } from "@alanscodelog/utils/keys"
import { computed, type Ref, ref, watch } from "vue"

// careful, this needs to point to the highlight.js package beside the package (in the node_modules above it), not in the package or it won't work when used normally (but will when linked in the playground), it also needs to be the shortest path, otherwise our key won't work
let themeModulePath = "../../../../../../../../highlight.js/styles/"

let themeModules = import.meta.glob("../../../../../../../../highlight.js/styles/*.css", {
	query: "?raw",
	import: "default"
})
// fallback for the node_modules inside the package for when using "../src/module" in the playground
const fallback = import.meta.glob("../../../../../../node_modules/highlight.js/styles/*.css", {
	query: "?raw",
	import: "default"
})

if (keys(themeModules).length === 0 && keys(fallback).length !== 0) {
	themeModules = fallback
	themeModulePath = "../../../../../../node_modules/highlight.js/styles/"
	// eslint-disable-next-line no-console
	console.warn("Using fallback highlight.js themes locations. This should not be happening unless developing the library locally from it's playground using the linked module.")
}
if (keys(themeModules).length === 0) {
	// eslint-disable-next-line no-console
	console.warn("Could not find any highlight.js themes. This is probably an issue with the editor package. Please report it.")
}

const themeModuleNames = dedupe(keys(themeModules)
	.map(k => {
		const end = k.endsWith(".min.css") ? ".min.css" : ".css"
		return k.slice((`${themeModulePath}`).length, end.length * -1)
	}))

/**
 * Dynamically loads and creates the css for a given theme.
 *
 * It's result, themeCss should be added as a head tag (e.g. using useHead or teleporting a `<component :is="'style'">` to the head).
 *
 * By default it's an array of one item so you can more easily pass it to {@link unhead https://unhead.unjs.io/}'s useHead.
 *
 * By default, it will only apply the theme to the code blocks in the prosemirror editor. This is done via css nesting so might not work in older browsers.
 *
 * While additionalThemes can be provided, it is dangerous to inject them from user input.
 *
 * Instead, you can create a theme that only uses css variables, then allow the user to customize the css variables instead.
 *
 * Dark theme detection is just done by checking if the theme name contains "dark".
 *
 * You can provide different background colors for dark and light themes by providing a `darkLightBgs` and it will automatically apply them.
 */

export function useHighlightJsTheme({
	defaultTheme = "github-dark",
	darkLightBgs,
	additionalThemes,
	classes = ".ProseMirror",
	debug = false
}: {
	defaultTheme?: string
	darkLightBgs?: Ref<{
		dark: string
		light: string
	}>
	/** Additional class to wrap the loaded css in. */
	classes?: string
	additionalThemes?: Ref<Record<string, string>>
	debug?: boolean
} = {}) {
	if (debug) {
		// eslint-disable-next-line no-console
		console.log({ themeModules, themeModuleNames })
	}
	const theme = ref(defaultTheme)
	const knownThemes = ref(themeModuleNames)
	const loadedThemes = ref<Record<string, string>>({})

	if (additionalThemes) {
		watch(additionalThemes, newThemes => {
			if (debug) {
				// eslint-disable-next-line no-console
				console.log("Adding additional themes:", additionalThemes)
			}
			for (const [themeName, themeCss] of Object.entries(newThemes)) {
				loadedThemes.value[themeName] = themeCss
			}
		})
	}

	const rawThemeCss = ref<string>("")
	async function loadTheme(themeName: string): Promise<undefined | Error> {
		if (loadedThemes.value[themeName]) return
		const themeLoadingKey = `${themeModulePath}${themeName}.css`
		const func = themeModules[themeLoadingKey]
		if (func === undefined) {
			throw new Error(`Could not find theme: ${themeLoadingKey} in ${themeModulePath}. Valid paths are:\n${keys(themeModules).join(",\n")}`)
		}
		const themeStyle = await func()
		if (debug) {
			// eslint-disable-next-line no-console
			console.log("Loading theme:", { themeName, themeLoadingKey, themeStyle })
		}
		rawThemeCss.value = themeStyle as any
		return undefined
	}

	void loadTheme(theme.value)
	const isDark = computed(() => theme.value.includes("dark"))
	const backgroundColor = computed(() => {
		const colors = {
			dark: "#1e1e1e",
			light: "#ffffff",
			...(darkLightBgs?.value ?? {})
		}
		return colors[isDark.value ? "dark" : "light"]
	})
	const themeCss = computed(() => {
		const innerCss = `
			${indent(rawThemeCss.value, 3)}
			.hljs {
				background-color: ${backgroundColor.value};
			}
		`
		// if we run into issues with known browsers, we can
		// replace ($|\s|,)+(.*?.hljs\S*) and wrap each selector
		// but this seems very fragile
		return [
			isWhitespace(classes)
				? innerCss
				: crop`
			${classes} {
				${indent(innerCss, 1)}
			}
		`
		]
	})

	return {
		theme,
		knownThemes,
		loadTheme,
		isDark,
		backgroundColor,
		themeCss,
		rawThemeCss
	}
}
