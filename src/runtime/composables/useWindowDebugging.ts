import { Editor as VueEditor } from "@tiptap/vue-3"
import type { Ref, ShallowRef } from "vue"
import { watch } from "vue"

import type EditorComponent from "../components/Editor.vue"
import { debugNode } from "../pm/utils/internal/debugNode.js"
import { nodesBetween } from "../pm/utils/nodesBetween.js"

export const useWindowDebugging = (
	editorOrComponent: ShallowRef<VueEditor | undefined> | Readonly<ShallowRef<InstanceType<typeof EditorComponent> | undefined | null>>,
	keyName: string | Ref<string> = "witchcraftEditor",
	{ deleteOldKeyOnKeyChange = true }: { deleteOldKeyOnKeyChange?: boolean } = {}
) => {
	return watch(
		[
			() => editorOrComponent.value instanceof VueEditor
				? editorOrComponent.value
				: (editorOrComponent.value as any)?.editor,
			...(typeof keyName === "string" ? [] : [keyName]) as [Ref<string>]
		],
		([editor, maybeNewKey], [_, maybeOldKey]) => {
			if (!editor) return
			if (typeof window === "undefined" || typeof process === "undefined") return
			if (import.meta.dev && editor !== undefined) {
				const k = typeof keyName === "string" ? keyName : maybeNewKey
				if (!k) return
				const w = window as any
				if (deleteOldKeyOnKeyChange && maybeOldKey) {
					w[maybeOldKey] = undefined
				}
				w[k] = { key: k }
				w[k].editor = editor
				w[k].tr = () => (editor as any)!.state.tr
				w[k].debugNode = debugNode
				w[k].nodesBetween = nodesBetween
			}
		})
}
