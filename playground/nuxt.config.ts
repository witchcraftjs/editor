import pkg from "../package.json" with { type: "json" }

export default defineNuxtConfig({
	modules: [
		"@witchcraft/ui/nuxt",
		// the below also works, just remember to run the update-dep script and uncomment ../src/module above before attempting to use the file: linked module
		"@witchcraft/editor/nuxt"
		// "../src/module"
	],
	devtools: { enabled: true },
	app: {
		baseURL: process.env.CI
			? `/${pkg.name.slice(pkg.name.indexOf("/") + 1)}/demo`
			: "/"
	},
	future: {
		compatibilityVersion: 4 as const
	},
	compatibilityDate: "2024-09-23",
	witchcraftEditor: {
		// only needed for the package's playground
		// because we can't resolve the package name from tailwind
		_playgroundWorkaround: true
	}
})
