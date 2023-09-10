/** Required for vitest, todo, move to using nuxt's test utils? */
import path from "path"
import { defineConfig } from "@alanscodelog/vite-config"
import tailwindcss from "@tailwindcss/vite"
import vue from "@vitejs/plugin-vue"
import { unpluginIconViteOptions } from "@witchcraft/ui/build/unpluginIconViteOptions"
import { WitchcraftUiResolver } from "@witchcraft/ui/build/WitchcraftUiResolver"
import path from "path"
import IconsResolver from "unplugin-icons/resolver"
import Icons from "unplugin-icons/vite"
import Components from "unplugin-vue-components/vite"
import type { PluginOption } from "vite"



export default defineConfig({
	entryGlobs: [
		"src/**/*.ts",
		"src/**/*.vue",
		"!src/**/*.stories.*",
		"!src/module.ts",
		"!src/**/*.d.ts",
	],
	pluginOpts: {
		// just for ./src/nuxt/*
		externalizeDeps: { include: [ "#imports" ]},
		typesPlugin: { dtsGenerator: "echo" }
	},
}, {
	plugins: [
		vue() as any,
		Components({
			// don't auto-import our own components
			dirs: [],
			resolvers: [
				IconsResolver(),
				WitchcraftUiResolver(),
			],
			dts: "./types/components.d.ts",
		}),
		Icons(unpluginIconViteOptions),
		tailwindcss()
	],
	build: {
		outDir: "dev",
		
	},
	optimizeDeps: {
		include: [
			"highlight.js/lib/core",
		],
	},
},{
	test: {
		// specifying just tests/... is including stuff it shouldn't ???
		dir: `${path.resolve(import.meta.dirname)}/tests`,
	},
	css: { postcss: undefined },
	server: {
		port: 3001,
	},
})
