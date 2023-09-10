import { delay } from "@alanscodelog/utils/delay"
import { keys } from "@alanscodelog/utils/keys"
import { render } from "@testing-library/vue"
import type { Node } from "@tiptap/pm/model"
import { type Editor, generateHTML } from "@tiptap/vue-3"
import { nanoid } from "nanoid"

import TestWrapper from "../../src/runtime/components/TestWrapper.vue"
import { testExtensions } from "../../src/runtime/pm/testSchema.js"

export async function setupWrapper(doc: Node | string, props?: any, loadDelay: number = 0) {
	const testId = nanoid(10)

	const docs = { ...(props?.documents ?? {}) }
	for (const id of keys(docs)) {
		docs[id] = {
			...docs[id],
			content: typeof docs[id].content === "string"
				? docs[id].content
				: generateHTML(docs[id].content, testExtensions)
		}
	}
	const root = {
		title: "Root",
		content: typeof doc === "string"
			? doc
			: generateHTML(doc.toJSON(), testExtensions)
	}

	const c = render(TestWrapper, {
		props: {
			testId,
			docId: "root",
			...props,
			documents: {
				...props?.documents,
				root
			}
		}
	})
	let editor = (window as any)?.[`editor-${testId}`]?.editor as Editor
	let editorReadyResolve: (val: Editor) => void
	const promise = new Promise<Editor>(resolve => editorReadyResolve = resolve)
	const interval = setInterval(() => {
		editor = (window as any)?.[`editor-${testId}`]?.editor as Editor
		if (editor) {
			clearInterval(interval)
			editorReadyResolve(editor)
		}
	}, 100)
	setTimeout(() => {
		if (!editor) {
			clearInterval(interval)
			throw new Error("Expected editor to be ready after 5000ms.")
		}
	}, 5000)
	await delay(loadDelay)
	return { c, editor: await promise }
}
