import pkg from "../package.json" with { type: "json" }

export default defineNuxtConfig({
	modules: [

		"@witchcraft/ui/nuxt",
		// this won't work for local dev because both the app and the module will be using the ui library
		// and it uses symbols for value injection and because they're using the library
		// from different node_modules, it will fail
		// "../src/module"
		// this works, just remember to run the update-dep script and uncomment ../src/module above before attempting to use the file: linked module
		"@witchcraft/editor/nuxt"
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
