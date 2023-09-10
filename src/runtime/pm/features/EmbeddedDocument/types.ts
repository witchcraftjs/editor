import type { Dispatch, Editor, EditorOptions } from "@tiptap/core"
import type { ComputedRef, InjectionKey, Ref } from "vue"

import type { MaybeEmbedId } from "../DocumentApi/types.js"

export interface EmbeddedDocumentNodeOptions extends WithOnTriggerByEmbeddedBlockOptions {
	rootEditor: Editor
	/** Provided by the embedded node view. */
	getPos: () => number | undefined
	getEmbedId: () => MaybeEmbedId
}

/** Tells the editor and embedded doc view whether it's deeply embedded (more than one level) or not. */
export const isDeepEmbeddedInjectionKey = Symbol("isEmbeddedInjectionKey") as InjectionKey<boolean>
/** Tells the editor and embedded doc view whether it's embedded or not. */
export const isEmbeddedInjectionKey = Symbol("isEmbeddedInjectionKey") as InjectionKey<boolean>

/* Tells the editor whether it's a single block embed so it can set the right class on the wrapper. See {@link isEmbeddedBlock}. */
export const isEmbeddedBlockInjectionKey = Symbol("isEmbeddedBlockInjectionKey") as InjectionKey<ComputedRef<boolean> | Ref<boolean>>

/** Injects the editor component to use for embedded editors. */
export const embeddedEditorComponentInjectionKey = Symbol("embeddedEditorComponentInjectionKey") as InjectionKey<new (...args: any) => { editor?: Editor }>

/** Injects the parent editor id so the embedded editor can know who is embedding it (to track recursive/disallowed embeds). */
export const parentEditorIdInjectionKey = Symbol("parentEditorIdInjectionKey") as InjectionKey<Ref<string | undefined>>

/**
	* Injects the editor options so the embedded editor can use the same ones as it's parent.
	*
	* Note that autofocus is always disabled for embedded editors, hence it's omission.
	*/
export const embededEditorOptionsInjectionKey = Symbol("embededEditorOptionsInjectionKey") as InjectionKey<Partial<Omit<EditorOptions, "autofocus">>>

export type WithOnTriggerByEmbeddedBlockOptions = {
	/**
	 * When the editor is embedded and it's embedding a single block, certain commands are nullified and just return true and do nothing because they would break the embedding (e.g. enter, split, indent, etc).
	 *
	 * All such commands forward to the `embeddedCommandRedirect` command if it's available (otherwise a warning is logged). The `Embedded` extension takes care of registering this redirect and can redirect some of the commands to the root editor, but not all of them.
	 *
	 * You can use this function to handle the redirection yourself. You will get passed both editor instances (root and embedded) to facilitate communication. If you can handle the command, you should return a boolean as with a regular command. Otherwise you can return undefined to let the default handler take care of it.
	 *
	 * Note that if the change moves the node, the component will get remounted and the embedded editor will no longer exist (to, for example, focus it).
	 *
	 * The included EmbeddedNodeView takes care of auto-focusing when the selection matches it's position. So as a workaround for focus at least, you can use `tr.setNodeSelection(nodePos + offset)`. Note the use of `offset`. The node's position will have probably changed depending on the command so you will need to know how much to offset it or have some way to find it's position again. While the embedId is provided, it's not guaranteed there is only one node embedding that id, there might be multiple. A better way is to first find the parent embedding item id before executing your command, note the `blockId`, then use it to find the node again.
	 *
	 * See {@link redirectFromEmbedded} for creating redirectable commands.
	 */
	embeddedBlockCommandRedirect?: (
		commandName: string,
		args: any,
		context: {
			editor: Editor
			rootEditor: Editor
			nodePos: number | undefined
			embedId: MaybeEmbedId
			dispatch: Dispatch
		}
	) => boolean | undefined
}

export type OnTriggerByEmbeddedBlock = WithOnTriggerByEmbeddedBlockOptions["embeddedBlockCommandRedirect"]
