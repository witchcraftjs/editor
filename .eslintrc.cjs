/** @type {import('@typescript-eslint/utils').TSESLint.Linter.Config} */
module.exports = {
	root: true,
	extends: [
		// https://github.com/AlansCodeLog/eslint-config
		"@alanscodelog/eslint-config/vue",
	],
	// for vscode, so it doesn't try to lint files in here when we open them
	ignorePatterns: [
		"coverage",
		"dist",
		"docs",
	],
	rules: {
	},
	parserOptions: {
		parser: "@typescript-eslint/parser",
		project: "tsconfig.eslint.json",
		extraFileExtensions: ['.vue'], //fixes eslint not linting vue files
		// debugLevel: true,
	},
	settings: {
		jsdoc: {
			mode: "typescript",
		}
	},
	overrides: [
		{
			files: ["./*.{js,cjs,ts,vue}"],
			rules: {
				"@typescript-eslint/explicit-function-return-type": "off",
			}
		}
		// Eslint: https://eslint.org/docs/rules/
		// Typescript: https://typescript-eslint.io/rules/
		// Vue: https://eslint.vuejs.org/rules/
		// {
		// 	files: ["**/*.js", "**/*.ts", "**/*.vue"],
		// 	rules: {
		// 	},
		// },
	],
}

