import type { Editor } from "@tiptap/core"
import type { ShallowRef } from "vue"
import { watch } from "vue"

import { debugNode } from "../pm/utils/internal/debugNode.js"
import { nodesBetween } from "../pm/utils/nodesBetween.js"

export const useWindowDebugging = (editor: ShallowRef<Editor | undefined>): void => {
	watch(editor, () => {
		if (!editor.value) return
		if (typeof window === "undefined" || typeof process === "undefined") return
		if (process.env.NODE_ENV === "development" && editor.value !== undefined) {
			const w = window as any
			w.editor = editor.value
			w.tr = () => editor.value!.state.tr
			w.debugNode = debugNode
			w.nodesBetween = nodesBetween
		}
	})
}
