import { crop } from "@alanscodelog/utils"
import {
	addComponentsDir,
	addImportsDir,
	addTemplate,
	createResolver,
	defineNuxtModule
} from "@nuxt/kit"
import { defu } from "defu"
import fs from "node:fs/promises"


const { resolve } = createResolver(import.meta.url)

declare module "@nuxt/schema" {
	interface PublicRuntimeConfig {
		// eslint-disable-next-line @typescript-eslint/no-empty-object-type
		witchcraftEditor: {}
	}
}

export interface ModuleOptions {
	/** @internal */
	_playgroundWorkaround?: boolean
}

export default defineNuxtModule<ModuleOptions>({
	meta: {
		name: "witchcraftEditor",
		configKey: "witchcraftEditor"
	},
	defaults: {
		_playgroundWorkaround: false
	},
	moduleDependencies: {
		"@witchcraft/ui/nuxt": {
			version: "^0.3.2"
		}
	},
	async setup(options, nuxt) {
		nuxt.options.runtimeConfig.public.witchcraftEditor = defu(
			nuxt.options.runtimeConfig.public.witchcraftEditor,
			{
			}
		)

		addComponentsDir({ path: resolve("./runtime/components") })

		const pmFeatures = await fs.readdir(resolve("./runtime/pm/features"))
		for (const feature of pmFeatures) {
			nuxt.options.build.transpile.push(resolve(`./runtime/pm/features/${feature}/${feature}`))
			if (await fs.stat(resolve(`./runtime/pm/features/${feature}/components`)).then(_ => true).catch(() => false)) {
				addComponentsDir({ path: resolve(`./runtime/pm/features/${feature}/components`) })
			}
			if (await fs.stat(resolve(`./runtime/pm/features/${feature}/composables`)).then(_ => true).catch(() => false)) {
				addImportsDir(resolve(`./runtime/pm/features/${feature}/composables`))
			}
		}

		addTemplate({
			filename: "witchcraft-editor.css",
			write: true,
			getContents: () => options._playgroundWorkaround
				? crop`
					@import "${resolve("./runtime/assets/base.css")}";
					@import "${resolve("./runtime/assets/utils.css")}";
					@source "${resolve("./runtime/components")}";
					@source "${resolve("./runtime/pm")}";
				`
				: crop`
					@import "@witchcraft/editor/base.css";
					@import "@witchcraft/editor/utils.css";
					@source "${resolve("./runtime/components")}";
					@source "${resolve("./runtime/pm")}";
				`
		})

		addImportsDir(resolve("./runtime/composables"))
		nuxt.options.typescript = nuxt.options.typescript || {}
		nuxt.options.typescript.hoist = nuxt.options.typescript.hoist || []
		// nuxt.options.typescript.hoist.push('@tiptap/vue-3')
		// nuxt.options.typescript.hoist.push('@tiptap/pm')

		nuxt.options.alias["#witchcraft-editor"] = resolve("./runtime")
		nuxt.options.alias["#witchcraft-pm"] = resolve("./runtime/pm")

		// otherwise we get two versions of the same thing
		nuxt.options.build.transpile.push("@tiptap/vue-3")
		nuxt.options.build.transpile.push("@tiptap/pm")

		nuxt.hook("vite:extendConfig", config => {
			// @ts-expect-error - optimizeDeps is now readonly but also possibly undefined :/
			config.optimizeDeps ??= {}
			config.optimizeDeps.exclude ??= []
			// causes issues with the import.meta.globs here
			config.optimizeDeps.exclude.push("@witchcraft/editor/pm/features/CodeBlock/composables/useHighlightJsTheme")
			config.optimizeDeps.exclude.push("@witchcraft/editor/pm/features/CodeBlock/composables/useAsyncCodeBlockHighlight")
			// see above
			config.optimizeDeps.exclude.push("@tiptap/vue-3")
			config.optimizeDeps.exclude.push("@tiptap/pm")
			config.optimizeDeps.include ??= []
			config.optimizeDeps.include.push("highlight.js/lib/core")
			// idk why we also need to do this or it won't work from a real app
			config.optimizeDeps.include.push("@witchcraft/editor > highlight.js/lib/core")
		})
	}
})
