import { isBlank } from "@alanscodelog/utils/isBlank"
import { mergeAttributes, Node } from "@tiptap/core"
import { VueNodeViewRenderer } from "@tiptap/vue-3"

import EmbeddedNodeView from "./components/EmbeddedNodeView.vue"

import type { HTMLAttributesOptions } from "../../../types/index.js"
import { isValidId } from "../Blocks/utils/isValidId.js"

declare module "@tiptap/core" {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		// eslint-disable-next-line @typescript-eslint/no-empty-object-type
		embeddedDocument: {
		}
	}
}

/**
 * Extension that adds support for embedded documents.
 *
 * Must be used with the provided `History` extension instead of the normal one.
 *
 * The node view provides `isEmbedded` and `isDeepEmbedded` for any child component instances.
 *
 * If using a custom editor wrapper, you will need to:
 *
 * - Provide the custom editor wrapper component with the {@link embeddedEditorComponentInjectionKey} injection key. The component should expose the tiptap editor instance with `defineExpose` as the `editor` property.
 * - Provide the document api by creating an instance of the {@link DocumentApi} class and providing it with the {@link documentApiInjectionKey}.
 * - Provide a ref to it's document's id with the {@link parentEditorIdInjectionKey} if it's using ids to load documents so that the EmbeddedNodeview can detect circular embeds and avoid rendering them.
 * - Add the class `editor-is-embedded-block` to the editor wrapper (it must be the immediate parent of view.dom) so commands such as enter can check if they should act differently. See {@link isEmbeddedBlock}.
 */

// eslint-disable-next-line @typescript-eslint/naming-convention
export const EmbeddedDocument = Node.create<HTMLAttributesOptions>({
	name: "embeddedDoc" satisfies NodeEmbeddedDocumentName,
	group: "block",
	draggable: false,
	atom: true,
	// defining: true,
	addNodeView() {
		// am having lint only issues
		return VueNodeViewRenderer(EmbeddedNodeView, {
			stopEvent() {
				return true
			},
			ignoreMutation() {
				return true
			}
		})
	},
	addOptions() {
		return {
			HTMLAttributes: {
				default: { }
			}
		}
	},
	addAttributes() {
		return {
			embedId: {
				default: { docId: undefined, blockId: undefined }
			}
		}
	},
	parseHTML() {
		return [{
			tag: `div[type=${this.name}]`,
			getAttrs: (element: HTMLElement) => {
				const docId = element.getAttribute("embeddocid")
				if (docId === undefined || docId === null) { return false }
				if (isBlank(docId) || !isValidId(docId)) {
					return { embedId: { docId: undefined, blockId: undefined } }
				}
				const blockId = element.getAttribute("embedblockid")

				return {
					embedId: {
						docId: isBlank(docId) || !isValidId(docId) ? undefined : docId,
						blockId
					}
				}
			}
		}]
	},

	// eslint-disable-next-line @typescript-eslint/naming-convention
	renderHTML({ HTMLAttributes }) {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const mergedHTMLAttributes = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
			embeddocid: HTMLAttributes.embedId.docId ?? "",
			embedblockid: HTMLAttributes.embedId.blockId,
			type: this.name
		})
		delete mergedHTMLAttributes.embedId
		return [
			"div",
			mergedHTMLAttributes
		]
	}
})
export type NodeEmbeddedDocumentName = "embeddedDoc"
