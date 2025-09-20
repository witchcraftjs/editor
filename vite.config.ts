/** Required for vitest, todo, move to using nuxt's test utils? */
import { run } from "@alanscodelog/utils/node"
import { defineConfig } from "@alanscodelog/vite-config"
import vue from "@vitejs/plugin-vue"
import { unpluginIconViteOptions } from "@witchcraft/ui/build/unpluginIconViteOptions"
import { WitchcraftUiResolver } from "@witchcraft/ui/build/WitchcraftUiResolver"
import path from "node:path"
import IconsResolver from "unplugin-icons/resolver"
import Icons from "unplugin-icons/vite"
import Components from "unplugin-vue-components/vite"
import type { PluginOption } from "vite"


const highlightJsLanguageInfoPlugin = (): PluginOption => ({
	name: "highlightJsLanguageInfoPlugin",
	// eslint-disable-next-line no-console
	buildStart: async () => run(`npm run gen:highlightJsLangInfo`).promise.catch(e => { console.log(e.stdout); process.exit(1) }).then(() => undefined)
})

export default defineConfig({
	entryGlobs: [
		"src/**/*.ts",
		"src/**/*.vue",
		"!src/**/*.stories.*",
		"!src/module.ts",
		"!src/**/*.d.ts"
	],
	pluginOpts: {
		// just for ./src/nuxt/*
		externalizeDeps: { include: ["#imports"] },
		typesPlugin: { dtsGenerator: "echo" }
	}
}, {
	plugins: [
		highlightJsLanguageInfoPlugin(),
		vue() as any,
		Components({
			// don't auto-import our own components
			dirs: [],
			resolvers: [
				// @ts-expect-error - vue-tsc error
				IconsResolver(),
				WitchcraftUiResolver()
			],
			dts: "./types/components.d.ts"
		}),
		Icons(unpluginIconViteOptions)
	],
	build: {
		outDir: "dev"
	}
}, {
	test: {
		// specifying just tests/... is including stuff it shouldn't ???
		dir: `${path.resolve(import.meta.dirname)}/tests`,
		projects: [
			{
				extends: "vite.config.ts",
				test: {
					name: "e2e",
					css: true,
					setupFiles: ["./tests/setup-browser.ts"],
					include: [
						`*.e2e.{test,spec}.ts`,
						`**/*.e2e.{test,spec}.ts`
					],
					dir: "tests",
					browser: {
						enabled: true,
						provider: "playwright",
						instances: [
							{
								browser: "chromium"
							}
						]
					}
				}
			},
			{
				extends: "vite.config.ts",
				test: {
					include: [
						`*.unit.{test,spec}.ts`,
						`**/*.unit.{test,spec}.ts`
					],
					name: "unit",
					environment: "node"
				}
			}
		]
	},
	css: { postcss: undefined },
	server: {
		port: 3001
	}
})
