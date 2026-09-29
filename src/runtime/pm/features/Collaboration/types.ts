/*
 * Shared types for the per-document collaboration plugins.
 * All types live here; the individual plugin files import from this module.
 */
import type { DecorationAttrs } from "@tiptap/pm/view"
import type { ProsemirrorBinding } from "@tiptap/y-tiptap"
import type * as Y from "yjs"

import type { DocumentApiInterface } from "../DocumentApi/types.js"
/**
 * The parts of the {@link DocumentApiInterface} used by the collaboration plugins.
 */
export type CollabDocumentApi = Pick<DocumentApiInterface, "getFromCache" | "updateDocument">

/**
 * The per-document collaboration state. Everything the plugins and bridge wiring need lives here.
 *
 * Created by {@link createCollaborationPlugins}.
 */
export type Bridge = {
	yDoc: Y.Doc
	fragment: Y.XmlFragment
	undoManager: Y.UndoManager
	binding: ProsemirrorBinding
	/** Set synchronously around pushFromPM's transact so the observer can skip our own pushes (transact is synchronous, so no async race). */
	isPushing?: boolean
	pushFromPM: (doc: unknown) => void
}

// the following are types from y-tiptap that it does not export


/**
 * A selection captured as yjs relative positions plus the selection's jsonID type.
 * Anchored to the document, so it survives content changes above/below.
 * Structurally matches the return type of @tiptap/y-tiptap's getRelativeSelection (upstream does not export a named type for it).
 */
export type RelativeSelection = {
	/** The selection class's jsonID (e.g. "text", "node", "nodeRange", "all"). */
	type: string
	/** Only meaningful for NodeRangeSelection; undefined for every other type. */
	depth?: number
	anchor: Y.RelativePosition | null
	head: Y.RelativePosition | null
}

export type CursorUser = {
	name?: string
	color?: string
}

export type CursorOptions = {
	/** Returns false to skip rendering a remote peer's cursor/selection (e.g. filter out bots). */
	awarenessStateFilter?: (localClientId: number, clientId: number, state: unknown) => boolean
	/** Builds the DOM element rendered at a remote peer's cursor position. */
	cursorBuilder?: (user: CursorUser, clientId: number) => HTMLElement
	/** Returns the decoration attrs for a remote peer's selection highlight. */
	selectionBuilder?: (user: CursorUser, clientId: number) => DecorationAttrs
	/** The awareness field this plugin reads cursors from and writes its own cursor to. */
	cursorStateField?: string
}

