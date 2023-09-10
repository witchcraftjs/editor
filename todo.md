- [~] Remove/segment tiptap styles.
- [ ] i18n
- [ ] We often don't need to be checkingthe to type in commands.
- Cleanup fallbacks and nodetypes. Fallback => createAndFill if possible.
- Move pinToItemDistance to menu options?
- Fix link menu condition.
- Fix table should not be able to press enter.

# Commands
- [>] List of valid commands.

# Requirements


# Future
- [ ] Comments
- [^] Modal mode.
	- [^] Change selection => apply command => return selection. For vim like selections.
# Easy, Low Priority
- [ ] Up arrow at last node that doesn't support gap cursor adds a new paragraph.
- [ ] Allow configuring popup options in mark menus.
- [ ] Prevent link menu from being opened when it wasn't a user focus event (manually through some meta on the tr). 
- [ ] Normalize renderHTML with nodes to get same look.
# Difficult, Low Priority
- [ ] Shift select is broken around embeds and tables.
- [ ] Figure out way to disallow undoing of file loader nodes.
- [?] Enter at end of embed redirects to parent?
- [ ] Dragging across document embed boundaries.
- [ ] Injectable bubble menus?
- [ ] If in the embedded block of an embedded document, indent the embedded block in the parent.
- [ ] Async Oembed
- [ ] Rewrite the table node.
	- [ ] Dragging multiple block selections into a table is completely fucked. Figure out a way to turn them into multiple lines/rows?
- [ ] Don't show the list expander when it's just a single very nested item.
- [?] Use/implement BlockSelection https://github.com/ccorcos/prosemirror-examples/blob/b961b7545c527655eb67717a181860beefd4dcf8/src/components/BlockSelectionPlugin.tsx
- [ ] At last line / at first line helpers.

# Tests needed:
- [ ] Link Menu tests.
- [ ] Redirected commands tests.
- [ ] Complex parsing tests.
- [ ] Enter key tests.

# Done
- [x] Backspace in blockquotes is not working.
- [x] Internal links are not working.
- [~~] Add block button on hover over the end of the editor.
	- Ensured last is paragraph instead.
- [x] Enter in table should start new paragraph block. ...sortof
- [x] Check all keys have state plugin if needed.
- [x] Convert options to interfaces.
- [x] Avoid interface merging of unused if possible.
- [x] Highlight parsing tests.
- [x] Images/Videos/Attachments
	- [x] Custom image node. Tiptap one adds margins.
	- [x] Image Preview Node
	- [x] Drop
- [x] Command menu.
- [x] Highlights
- [x] Table commands bubble menu.
- [x] Command bar styles.
- [~~] Check if we can replace on* in components by computed refs depending on props.editor.state
	- Nope, causes weird issues with mark menu at least.
- [x] Fix gap cursor.
- Gap cursor on the list works properly but looks wrong (is at the top of the list???).
- [x] Include/create gap cursor styles.
- [x] Fix usage of dispatch.
- [x] Replace ChainedCommands with SingleCommands.
- [x] Weird bug where both command bar menus show (embed and editor)
- [x] update unfocused selection css docs
- [x] Swap any mousedowns for pointerdowns.
- [x] Down/up arrows in embeds. Already works.
- [x] Content Embed
	- [x] iFrame/YouTube
		- [x] Per provider params?
- [x] Fix html attributes handling.
- [x] Handle enter at the end of special blocks. Prevent at command level if editor is embedded.
  	- [x] Partial Embeds shouldn't allow enter at all.
	- [x] Other should start new block.
- [x] Change parsehtml to return false if rule shoundn't match.
- [x] Tests for file loader.
	- [x] Auto delete last.
	- [x] Auto delete nested.
	- [x] Auto delete sibling but not wrapping list.
- [x] Editor block embed?
	- [x] Block/link picker.
		- [x] Check undo state isn't getting accidentally shared.
	- [x] Undo

- [x] Keyboard shortcuts not working in embedded editor.
- [x] Properly override some commands.
- [x] See what selectingIndicator did.
- [x] Change commands to take a position or selection if possible.
- [x] Fix items with tables not being able to get their state types changed.
- [x] Language suggestions causing overflow :(
- [x] Set selection to embed range when selecting block.
- [x] Prevent dragging across document boundaries.
- [x] Document drag scroll.
- [x] Add configuration for scroll margins and styling.

- [~~] Refactor dropindicator to be relative to editor. 
	- Did not work well. Absolutely posiitoned element does not get overflow hidden?
- [x] uuid validation on load
- [x] Prevent duplicate block ids.
- [x] Add doc loading state.
- [x] Fix contentless drags.
- [x] Prevent recursive embedding of the same document.
- [x] ~~Rework shift option for nodesBetween.~~ Reworked dependant commands instead.
- [x] ~~Double check root extension state can be shared.~~ Added instancePerEditor option.
- [x] It thinks there's no history. Again
- [x] link menu and related trs add to history false
- [x] Deduping of parent plugins
- [x] Regular hard break with shift + enter not working.
- [x] Implemented indent/unindent in code block.
	- This is not meant to be used with tab set to indenting item blocks.
- [x] Links
	- [x] External
		- [x] Possible to have an allowed protocols list?
			- This can just be implemented in the openInternal function.
	- [x] Internal
		- [x] Autocomplete
- [x] Setting code block twice unindents block!
- [x] Hitting enter on a list item is unindenting it if it's blank. Write own splitlistItem command.
- [x] Tab indents a list item.
- [~~] Override splitListItem to make it usable.
	- Using custom instead.
- [x] ~~Remove selection~~ Adjust selection after dropping a single item, when the selection goes outside the item.
- [x] Move item up/down.
	- [x] Make children move with it.
	- [x] Expand selection when start.depth is deeper than end.depth, otherwise it get's very complicated.
- [x] Backspace is doing weird things.
- [x] Hard break code block.
- [x] Split code block.
- [x] Triple escape code block + list split.

- [x] Recheck block types


--- Scratchpad ---

export const focusCodeBlockLanguage = (
	codeBlockType: string,
	langPickerClass: string = "lang-picker"
) =>
	(dir: "up" | "down"): Command =>
		({ state, tr, view }) => {
			const { from, to, empty, $from } = state.selection.map(tr.doc, tr.mapping)
			if (!empty) { return false }
			const $node = tr.doc.resolve(from)
			debugNode($node.node())
			const isCodeBlock = $node.node()?.type.name === codeBlockType
			console.log(dir)
			if (dir === "up" && isCodeBlock) {
				const firstLineIndex = $from.parent.textContent.indexOf("\n")
				const firstLine = firstLineIndex > 0
					? $from.parent.textContent.slice(0, firstLineIndex)
					: false as const
				const nodePos = from - $node.start()
				if (!firstLine || (nodePos >= 0 && nodePos <= firstLine.length)) {
					const domNode = view.domAtPos(from - 1).node
					focusInput(domNode, langPickerClass)
				}
			} else if (dir === "down" && !isCodeBlock) {
				const lastLineIndex = $from.parent.textContent.lastIndexOf("\n")
				const lastLine = lastLineIndex > 0
				? $from.parent.textContent.slice(lastLineIndex + 1)
				: false as const
				const nodePos = from - $node.start()
				if (!lastLine || (nodePos >= 0 && nodePos <= lastLine.length)) {
					console.log("at last")
					const endOfLinePlusOne = nodePos + (lastLine ? lastLine.length - nodePos + 1 : 1)
					const nextSel = TextSelection.findFrom(tr.doc.resolve(tr.doc.resolve(endOfLinePlusOne).pos), 1, true)

					console.log(nextSel)
					// const nextNode = tr.doc.nodesBetween(from, tr.doc.resolve(0).end(), (node,pos) => {
					// 	if (node.type?.name === codeBlockType) {
					// 		return true
					// 	}
					// })
					// const domNode = view.domAtPos(from).node
					// focusInput(domNode, langPickerClass)
				}
			}
			return false
		}
---
// [`<iframe width="560" height="315" src="https://www.youtube.com/embed/0GoU-A996Bc?si=rXgwW-Xfb19ZMq2u" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`],
		// [`<iframe src="https://www.google.com/search?q=reddit+js+library+detecting+embed+urls&oq=reddit+js+library+detecting+embed+urls&gs_lcrp=EgZjaHJvbWUyBggAEEUYOdIBCDUzMTJqMGo3qAIAsAIA&sourceid=chrome&ie=UTF-8"></iframe>`],
		// [`<iframe src="https://player.vimeo.com/video/215976284?h=66cf6fc4bb" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`],
		// ["https://player.vimeo.com/video/215976284?h=66cf6fc4bb"],
---
<li><span>NotLink</span> <a href='https://google.com'>A <b>1</b></a></li>
	<li><a href='internal://some-id'>Internal</a></li>
	<li><p>B 1<br/>     B 1</p>
	<ul>
		<li><div embed-id="some-id#some-sub-id">Embedded</div></li>
		<li node-type="unordered"><p> C 1</p>
			<ul>
				<li><p>D 1</p>
					<pre><code class='language-javascript'>E 1</code></pre>
				</li>
				<li><p>D 2</p>
				</li>
				<li><p>D 3</p>
				</li>
			</ul>
		</li>
	</ul>
---
	const offsetMap = StepMap.offset(-start + 1)
	// see https://github.com/ueberdosis/tiptap/issues/1883
	// and https://github.com/ueberdosis/tiptap/issues/74#issuecomment-460206175
	const steps: ReplaceStep[] = JSON.parse(
		JSON.stringify(tr.steps)
	).map((step: any) => Step.fromJSON(state.schema, step))
	const allMappableSteps = []
	for (const step of steps) {
		const fromOk = step.from >= start && step.from <= end
		const toOk = step.to >= start && step.to <= end
		if (fromOk && toOk) allMappableSteps.push(step)
		else {break}
	}
	if (allMappableSteps.length === steps.length) {
		for (const step of steps) {
			const mapped = step.map(offsetMap)!
			console.log(mapped)
			intTr.step(mapped)
		}
	} else {

---
import assert from "node:assert"
import { chromium, devices } from "playwright";

(async () => {
	// Setup
	const browser = await chromium.launch({
		headless: false,
		executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
	})
	const context = await browser.newContext(devices["iPhone 11"])
	const page = await context.newPage()

	// The actual interesting bit
	await context.route("**.jpg", route => route.abort())
	console.log(1)
	await page.goto("https://example.com/")
	console.log(2)

	const pt = await page.title()
	console.log("page title")
	console.log(JSON.stringify(pt))

	assert(pt === "Example Domain") // 👎 not a Web First assertion

	const sleep = ms => new Promise(r => setTimeout(r, ms))
	await sleep(5000)

	// Teardown
	await context.close()
	await browser.close()
})()
---
<template>
<div class="commands-list flex flex-col">
	<div
		class="command border-t border-neutral-500 p-1 :first-of-type:border-none"
		:title="command.description"
		v-for="command in commandsList"
		:key="command.name"
	>
		{{ command.title ?? command.name }}
	</div>
</div>
</template>

<script setup lang="ts">
import type { ChainedCommands } from "@tiptap/vue-3"
import { computed, ref } from "vue"
type Command = {
	name: keyof ChainedCommands ,
	title?: string ,
	description?: string;
} & (
{variations: any[][] } | {args?: any[]}
)
type FullCommand = Omit<Command, "variations" > & { args: any[] }
const props = defineProps<{
	commands: Command[]
} >()

const commandsList = computed<FullCommand[]>(() => props.commands.map(command => {
	if ("variations" in command && command.variations) {
		return command.variations.map(variation => ({
			...command,
			args: variation,
		})) satisfies FullCommand[]
	} else {
		return command as FullCommand
	}
}).flat())
</script>
---

const $deepest = convertTo.resolve(Math.floor(convertTo.nodeSize / 2))
		if (keepsContent && ($deepest.node().type.name === "text" || $deepest?.parent)) {
			const selPos = posByNode(editor.state.doc, {
				textContent: "ABC",
				type: $deepest.node().type.name === "text" ? $deepest.parent.type : $deepest.node().type,
			})
			const closest = TextSelection.near(editor.state.doc.resolve(selPos), -1)
			console.log(closest.from, editor.state.selection.from, editor.state.doc.resolve(selPos).node().type.name)
		}
---
const commands: { key: keyof ChainedCommands, buttons: any[][] }[] = [
	{ key: "indentListItem" , buttons: [[]]},
	{ key: "unindentListItem" , buttons: [[]]},
	{ key: "toggleHeading", buttons: [1, 2, 3, 4, 5, 6, undefined].map(level => [{ level }]) },
	{ key: "toggleBold", buttons: [[]]},
	{ key: "toggleItalic", buttons: [[]]},
	{ key: "toggleCode", buttons: [[]]},
	{ key: "toggleCodeBlock", buttons: [[]]},
	{ key: "setCodeBlock", buttons: [
		[{ language: "javascript" , loading: true }],
		[{ language: "css", loading: true }],
	]},
	{ key: "focusCodeBlockLanguage", buttons: [[]]},
	{ key: "setHardBreak", buttons: [[]]},
	{ key: "undo", buttons: [[]]},
	{	key: "redo", buttons: [[]]},
	{ key: "moveListItem", buttons: [["down"], ["up"]]},
	{ key: "changeListItemType", buttons: [
		[{ type: "none" }],
		[{ type: "stateful-task", state: "unchecked" }],
		[{ type: "stateful-task", state: "partial" }],
		[{ type: "stateful-task", state: "cancelled" }],
		[{ type: "stateful-task", state: "checked" }],
		[{ type: "ordered" }],
		// todo list all list-style-types
		[{ type: "unordered" }],
		[{ type: "ordered-upper-roman" }],
		[{ type: "ordered-lower-roman" }],
		// "unordered-square",
	]},
]
