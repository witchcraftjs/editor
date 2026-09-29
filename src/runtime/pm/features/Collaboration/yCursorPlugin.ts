/*
 * Adapted from @tiptap/y-tiptap's yCursorPlugin (https://github.com/tiptap/y-tiptap).
 * Divergence: upstream reads the binding from per-view ySyncPlugin state; ours takes a shared Bridge directly.
 */
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { Decoration, type DecorationAttrs, DecorationSet } from "@tiptap/pm/view"
import { absolutePositionToRelativePosition, relativePositionToAbsolutePosition, setMeta } from "@tiptap/y-tiptap"
import type { Awareness } from "y-protocols/awareness"
import * as Y from "yjs"

import type { Bridge, CursorOptions, CursorUser } from "./types.js"
import { ySyncPluginKey } from "./ySyncPlugin.js"

export const yCursorPluginKey = new PluginKey<DecorationSet>("yjs-cursor")

const defaultAwarenessStateFilter = (currentClientId: number, userClientId: number): boolean => currentClientId !== userClientId

const defaultCursorBuilder = (user: CursorUser): HTMLElement => {
	const cursor = document.createElement("span")
	cursor.classList.add("ProseMirror-yjs-cursor")
	cursor.setAttribute("style", `border-color: ${user.color}`)
	const userDiv = document.createElement("div")
	userDiv.setAttribute("style", `background-color: ${user.color}`)
	userDiv.insertBefore(document.createTextNode(user.name!), null)
	const nonbreakingSpace1 = document.createTextNode("\u2060")
	const nonbreakingSpace2 = document.createTextNode("\u2060")
	cursor.insertBefore(nonbreakingSpace1, null)
	cursor.insertBefore(userDiv, null)
	cursor.insertBefore(nonbreakingSpace2, null)
	return cursor
}

const defaultSelectionBuilder = (user: CursorUser): DecorationAttrs => {
	return {
		style: `background-color: ${user.color}70`,
		class: "ProseMirror-yjs-selection"
	}
}

const rxValidColor = /^#[0-9a-f]{6}$/i

const createDecorations = (
	doc: { content: { size: number } },
	bridge: Bridge,
	awareness: Awareness,
	awarenessFilter: (localClientId: number, clientId: number, state: unknown) => boolean,
	createCursor: (user: CursorUser, clientId: number) => HTMLElement,
	createSelection: (user: CursorUser, clientId: number) => DecorationAttrs
): DecorationSet => {
	if (bridge.binding.mapping.size === 0) {
		return DecorationSet.create(doc as never, [])
	}
	const decorations: Decoration[] = []
	awareness.getStates().forEach((aw, clientId) => {
		if (!awarenessFilter(bridge.yDoc.clientID, clientId, aw)) {
			return
		}

		if (aw && (aw as any).cursor != null) {
			const cursor = (aw as any).cursor as { anchor: string, head: string }
			const user: CursorUser = (aw as any).user || {}
			if (user.color == null) {
				user.color = "#ffa500"
			} else if (!rxValidColor.test(user.color)) {
				console.warn("A user uses an unsupported color format", user) // eslint-disable-line no-console
			}
			if (user.name == null) {
				user.name = `User: ${clientId}`
			}
			let anchor = relativePositionToAbsolutePosition(
				bridge.yDoc,
				bridge.fragment as never,
				Y.createRelativePositionFromJSON(cursor.anchor),
				bridge.binding.mapping as never
			)
			let head = relativePositionToAbsolutePosition(
				bridge.yDoc,
				bridge.fragment as never,
				Y.createRelativePositionFromJSON(cursor.head),
				bridge.binding.mapping as never
			)
			if (anchor !== null && head !== null) {
				const maxsize = Math.max(doc.content.size - 1, 0)
				anchor = Math.min(anchor, maxsize)
				head = Math.min(head, maxsize)
				decorations.push(
					Decoration.widget(head, () => createCursor(user, clientId), {
						key: clientId + "",
						side: 10
					})
				)
				const from = Math.min(anchor, head)
				const to = Math.max(anchor, head)
				decorations.push(
					Decoration.inline(from, to, createSelection(user, clientId), {
						inclusiveEnd: true,
						inclusiveStart: false
					})
				)
			}
		}
	})
	return DecorationSet.create(doc as never, decorations)
}

export const yCursorPlugin = (
	bridge: Bridge,
	awareness: Awareness,
	{
		awarenessStateFilter = defaultAwarenessStateFilter,
		cursorBuilder = defaultCursorBuilder,
		selectionBuilder = defaultSelectionBuilder,
		cursorStateField = "cursor"
	}: CursorOptions = {}
): Plugin =>
	new Plugin({
		key: yCursorPluginKey,
		state: {
			init(_, state) {
				return createDecorations(
					state.doc,
					bridge,
					awareness,
					awarenessStateFilter,
					cursorBuilder,
					selectionBuilder
				)
			},
			apply(tr, prevState, _oldState, newState) {
				const change = tr.getMeta(ySyncPluginKey)
				const yCursorState = tr.getMeta(yCursorPluginKey)
				if (
					(change !== undefined && !!change.isChangeOrigin)
					|| (yCursorState && (yCursorState as any).awarenessUpdated)
				) {
					return createDecorations(
						newState.doc,
						bridge,
						awareness,
						awarenessStateFilter,
						cursorBuilder,
						selectionBuilder
					)
				}
				return prevState.map(tr.mapping, tr.doc)
			}
		},
		props: {
			decorations: state => {
				return yCursorPluginKey.getState(state)
			}
		},
		view: view => {
			const awarenessListener = () => {
				// @ts-expect-error docView is an internal prosemirror-view property used to guard against dispatches during teardown
				if (view.docView) {
					setMeta(view, yCursorPluginKey, { awarenessUpdated: true })
				}
			}
			const updateCursorInfo = () => {
				const current = (awareness.getLocalState() ?? {}) as Record<string, unknown>
				if (view.hasFocus()) {
					const selection = view.state.selection
					const anchor = absolutePositionToRelativePosition(
						selection.anchor,
						bridge.fragment as never,
						bridge.binding.mapping as never
					)
					const head = absolutePositionToRelativePosition(
						selection.head,
						bridge.fragment as never,
						bridge.binding.mapping as never
					)
					if (!anchor || !head) return
					const existing = current[cursorStateField] as { anchor: Y.RelativePosition, head: Y.RelativePosition } | null | undefined
					if (
						existing == null
						|| !Y.compareRelativePositions(
							Y.createRelativePositionFromJSON(existing.anchor),
							anchor
						)
						|| !Y.compareRelativePositions(
							Y.createRelativePositionFromJSON(existing.head),
							head
						)
					) {
						awareness.setLocalStateField(cursorStateField, {
							anchor,
							head
						})
					}
				} else if (
					current[cursorStateField] != null
					&& relativePositionToAbsolutePosition(
						bridge.yDoc,
						bridge.fragment as never,
						Y.createRelativePositionFromJSON((current[cursorStateField] as any).anchor),
						bridge.binding.mapping as never
					) !== null
				) {
					awareness.setLocalStateField(cursorStateField, null)
				}
			}
			awareness.on("change", awarenessListener)
			view.dom.addEventListener("focusin", updateCursorInfo as any)
			view.dom.addEventListener("focusout", updateCursorInfo as any)
			updateCursorInfo()
			return {
				update: (update: any): void => {
					if (update.selectionSet || update.docChanged) updateCursorInfo()
				},
				destroy: () => {
					view.dom.removeEventListener("focusin", updateCursorInfo as any)
					view.dom.removeEventListener("focusout", updateCursorInfo as any)
					awareness.off("change", awarenessListener)
					awareness.setLocalStateField(cursorStateField, null)
				}
			}
		}
	})
