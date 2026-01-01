import BaseCollaboration, { type CollaborationOptions } from "@tiptap/extension-collaboration"

/**
 * Extension of the base collaboration extension without prosemirror plugins or storage.
 *
 * We can't use tiptap's collaboration extension (or any extension that creates the sync plugin) because it expects to be configured with the document's ydoc per editor.
 *
 * This doesn't mesh well with how the document api works (see {@link DocumentApi}).
 *
 * Instead we let the extension register anything it wants (shortcuts, commands, etc) except the plugins and storage. This way it can just be added to the list of editor extensions normally.
 *
 * Then there is a seperate function to actually create the plugins:
 *
 * {@link createCollaborationPlugins} creates the plugins **per doc** and can be used from your document api without an editor instance. See {@link useTestDocumentApi} for an example.
 *
 * It's also where the `enableContentCheck` option should be set if you need it. It's IGNORED if passed to the extension.
 */

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Collaboration = BaseCollaboration.extend<Omit<CollaborationOptions, "document" | "field" | "fragment">, Record<string, never>>({
	addStorage() {
		return {}
	},
	addProseMirrorPlugins() {
		return []
	}
})

