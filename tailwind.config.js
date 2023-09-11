// import componentsconfig from "@alanscodelog/vue-components/tailwind.config.ts"
// import { plugin as libraryPlugin } from "@alanscodelog/vue-components/tailwind/plugin.js"
//
// /** @type {import('tailwindcss').Config} */
// const config = {
// 	...componentsconfig,
// content: [
// 		...componentsconfig.content,
// 		"./index.html",
// 		"./src/**/*.vue",
// 		"./node_modules/@alanscodelog/vue-components/src/**/*.vue",
// 	],
// 	darkMode: "class",
// 	plugins: [
// 		libraryPlugin,
// 	],
// }
//
// export default config

import { config } from "@alanscodelog/vue-components/tailwind/config.js"
// import tailwindPlugin from "tailwindcss/plugin.js"


export default {
	...config,
	content: [
		...config.content,
		"./index.html",
		"./src/**/*.vue",
		"./node_modules/@alanscodelog/vue-components/src/**/*.vue",
	],
	plugins: [
		...config.plugins,

	],
}
