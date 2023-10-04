import type { Editor } from "@tiptap/vue-3"
import { onMounted, type Ref } from "vue"

import { debugNode } from "../utils/internal/debugNode.js"
import { nodesBetween } from "../utils/nodesBetween.js"


export const useWindowDebugging = (editor: Ref<Editor>): void => {
	onMounted(() => {
		if (process.env.NODE_ENV === "development") {
			const w = window as any
			w.editor = editor.value
			w.tr = () => editor.value.state.tr
			w.debugNode = debugNode
			w.nodesBetween = nodesBetween
		}
	})
}
