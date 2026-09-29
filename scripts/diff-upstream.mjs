#!/usr/bin/env node
/**
 * Diff our Collaboration files against upstream @tiptap/y-tiptap source.
 * Usage: node scripts/diff-upstream.mjs <upstream-src-dir>
 */
import { execSync } from "node:child_process"
import { existsSync } from "node:fs"
import { resolve, join } from "node:path"

const upstreamRoot = process.argv[2]
if (!upstreamRoot) {
	console.error("Usage: node scripts/diff-upstream.mjs <y-tiptap-root-dir>")
	process.exit(1)
}
const upstreamDir = join(upstreamRoot, "src")
if (!existsSync(upstreamDir)) {
	console.error(`Upstream src dir not found: ${upstreamDir}`)
	process.exit(1)
}

const ourDir = resolve("src/runtime/pm/features/Collaboration")

// Map: our file → upstream file
const pairs = [
	["yCursorPlugin.ts", "plugins/cursor-plugin.js"],
	["yUndoPlugin.ts", "plugins/undo-plugin.js"],
	["ySyncPlugin.ts", "plugins/sync-plugin.js"],
]

for (const [ours, theirs] of pairs) {
	const ourPath = join(ourDir, ours)
	const theirPath = join(upstreamDir, theirs)
	console.log(`\n${"=".repeat(60)}`)
	console.log(`${ours}  vs  ${theirs}`)
	console.log("=".repeat(60))
	// git diff --no-index produces a unified diff that delta can consume.
	// -w ignores whitespace (tabs vs spaces), --color=always for delta's parser.
	try {
		execSync(
			`git diff --no-index -w --color=always "${theirPath}" "${ourPath}" | delta --side-by-side`,
			{ stdio: "inherit" }
		)
	} catch (e) {
		// git diff exits 1 when files differ — that's expected, not an error.
		if (e.status !== 1) console.error(e.message)
	}
}
