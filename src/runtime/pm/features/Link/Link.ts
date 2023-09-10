import { crop } from "@alanscodelog/utils/crop"
import { keys } from "@alanscodelog/utils/keys"
import { type Command, getAttributes } from "@tiptap/core"
import { Link as TipTapLink, type LinkOptions } from "@tiptap/extension-link"
import { Plugin, type PluginSpec, TextSelection } from "@tiptap/pm/state"

import { type AdditionalLinkOptions as AdditionalLinkNodeOptions, type DirectLinkClickPluginState, directLinkClickWithModifierPluginKey, linkMenuPluginKey, type LinkMenuPluginState } from "./types.js"

import { createStateOnlyPluginObjApply } from "../../utils/createStateOnlyPluginObjApply.js"
import { getMarkPosition } from "../../utils/getMarkPosition.js"
import { getMarksInSelection } from "../../utils/getMarksInSelection.js"

declare module "@tiptap/core" {

	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		links: {
			/**
			 * Opens the link bubble menu when it's over a link and auto open is true.
			 * If the menu is already open, it focuses it.
			 */
			openLinkMenu: (opts?: { type?: "external" | "internal" }) => ReturnType
			/** Closes the menu and focuses back to the editor. */
			closeLinkMenu: () => ReturnType
			setLinkOpts: (opts: Partial<LinkOptions>) => ReturnType
			setLinkMenuOpts: (
				opts: Partial<Pick<
					LinkMenuPluginState,
					"autoOpen" | "allowAutoOpenOnRecentlyChangedLink"
				>>
			) => ReturnType
			changeOrAddLink: (href: string, title: string, internal: boolean) => ReturnType
			expandSelectionToLink: () => ReturnType
			openInternalLink: (href: string) => ReturnType
			openExternalLink: (href: string) => ReturnType
		}
	}
}
declare module "@tiptap/extension-link" {

	interface LinkOptions extends AdditionalLinkNodeOptions {}
}

/**
 * Extension of tiptap's link extension that can handle "internal" and "external" links.
 *
 * Adds an additional configurable `openLinkOnClickModifier` option.
 *
 * Requires the setting of the `openInternal` option if using internal links.
 *
 * If using a custom editor wrapper, you will need to add the `BubbleMenuLink` component somewhere in the wrapper or implement your own.
 */

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Link = TipTapLink.extend({
	name: "link" satisfies MarkLinkName,
	addOptions() {
		const internalLinkRegex = /internal:\/\/[\w-]+/

		return {
			...(this as any).parent?.(),
			openOnClick: false,
			openLinkOnClickModifier: "ctrlKey" as const,
			defaultProtocol: "https",
			protocols: ["https", "internal", "http", "ftp", "ftps", "mailto", "tel", "callto", "sms", "cid", "xmpp", "internal"],
			HTMLAttributes: {
				...(this as any).parent?.().HTMLAttributes,
				rel: "noopener noreferrer"
			},
			isInternalLink(href: string): boolean {
				return !!href.match(internalLinkRegex)
			},
			openInternal: (href: string) => {
				window.alert(crop`
					Editor requesting to open internal link "${href}", but opening of internal links is not implemented.
					Please specify how to open internal links with editor.commands.setLinkOpts.`)

				// eslint-disable-next-line no-console
				console.warn(crop`
					Requesting to open internal link: ${href}.
					Please specify how to open internal links with editor.commands.setLinkOpts.`)
			},
			openExternal: (href: string) => {
				window.open(href, "_blank")
			}
		}
	},
	addAttributes() {
		return {
			...(this as any).parent?.(),
			internal: {
				default: false,
				parseHTML: (el: HTMLElement) => {
					const href = el.getAttribute("href")
					return href && this.options.isInternalLink(href)
				}
			}
		}
	},
	addKeyboardShortcuts() {
		return {}
	},
	addCommands() {
		return {
			...(this as any).parent?.(),
			openLinkMenu: (
				{ type = "external" }: { type?: "external" | "internal" } = {}
			): Command => ({ tr, state, dispatch }) => {
				const wasState = linkMenuPluginKey.getState(state)?.state
				const mark = getMarksInSelection(state).find(_ => _.type.name === this.name)
				if (!dispatch) return true

				tr.setMeta("addToHistory", false)

				tr.setMeta(linkMenuPluginKey, {
					type,
					state:
						wasState
							? "focus"
							: mark ? "open" : "focus"
				})

				return true
			},
			closeLinkMenu: (): Command => ({ tr, state, commands, dispatch }) => {
				const wasState = linkMenuPluginKey.getState(state)?.state
				if (!wasState) return false
				if (dispatch) {
					tr.setMeta(linkMenuPluginKey, { state: false, type: undefined })
					commands.focus()
				}
				return true
			},
			setLinkMenuOpts: (
				opts: Partial<Pick<LinkMenuPluginState, "autoOpen" | "allowAutoOpenOnRecentlyChangedLink">>
			): Command => ({ tr, dispatch }) => {
				if (dispatch) {
					tr.setMeta(linkMenuPluginKey, opts)
				}
				return true
			},
			setLinkOpts: (opts: Partial<LinkOptions>): Command => ({ dispatch }) => {
				if (!dispatch) return true
				for (const key of keys(opts)) {
					(this.options as any)[key] = opts[key]
				}
				return true
			},
			expandSelectionToLink: (): Command => ({ tr, state, dispatch }) => {
				const markPos = getMarkPosition(state, this.type, state.selection.from)
				if (!markPos) return false
				if (dispatch) {
					tr.setSelection(TextSelection.create(state.doc, markPos.from, markPos.to))
				}
				return true
			},
			changeOrAddLink: (
				href: string,
				text: string,
				internal: boolean = false
			): Command => ({ tr, state, commands, dispatch }) => {
				const mark = getMarksInSelection(state).find(_ => _.type.name === this.name)
				const newMark = this.type.create({ href, internal })
				const markPos = mark && (getMarkPosition(state, this.type, state.selection.from) ?? getMarkPosition(state, this.type, state.selection.to))
				const { from, to, empty } = state.selection
				if (mark && markPos && (empty || (markPos.from <= from && markPos.to >= to))) {
					if (!markPos) return false
					if (dispatch) {
						const content = tr.doc.cut(markPos.from, markPos.to).textContent
						if (content !== text) {
							tr.delete(markPos.from, markPos.to)
							tr.insertText(text, markPos.from)
							tr.addMark(markPos.from, markPos.from + text.length, newMark)
						} else {
							tr.removeMark(markPos.from, markPos.to, this.type)
							tr.addMark(markPos.from, markPos.to, newMark)
						}
					}
				} else {
					if (dispatch) {
						const newTo = to + text.length
						tr.delete(from, to)
						tr.insertText(text, from)
						tr.addMark(from, newTo, newMark)
						tr.setSelection(TextSelection.create(tr.doc, newTo, newTo))
					}
				}
				if (dispatch) {
					tr.setMeta(linkMenuPluginKey, { justChangedLink: true })
				}
				return commands.focus()
			},
			openInternalLink: (href: string): Command => ({ dispatch }) => {
				if (dispatch) {
					this.options.openInternal(href)
				}
				return true
			},
			openExternalLink: (href: string): Command => ({ dispatch }) => {
				if (dispatch) {
					this.options.openExternal(href)
				}
				return true
			}
		}
	},
	onCreate() {
		if ("registerMenu" in this.editor.commands) {
			this.editor.commands.registerMenu({
				name: "linkMenu",
				pluginKey: linkMenuPluginKey,
				type: "mark",
				closeCommand: "closeLinkMenu",
				canShow: (_state, pluginState) => !!pluginState?.state
			})
		}
		return undefined
	},
	addProseMirrorPlugins() {
		const self = this
		// see https://github.com/ueberdosis/tiptap/issues/3389
		const directLinkClickWithModifierPlugin = new Plugin<DirectLinkClickPluginState>({
			key: directLinkClickWithModifierPluginKey,
			props: {
				handleClick(view, _pos, event) {
					if (self.options.openOnClick) return false
					const attrs = getAttributes(view.state, "link")
					const link = (event.target as HTMLElement)?.closest("a")
					const modifier = self.options.openLinkOnClickModifier
					if (!modifier || !link || !attrs.href) return false

					if (event[modifier] && event.button === 0) {
						if (attrs.internal) {
							self.editor.commands.openInternalLink(attrs.href)
						} else {
							self.editor.commands.openExternalLink(attrs.href)
						}

						return true
					}

					return false
				}
			}
		})

		const linkMenuStatePlugin = new Plugin<LinkMenuPluginState>({
			key: linkMenuPluginKey,
			appendTransaction(_trs, oldState, newState) {
				const value = linkMenuPluginKey.getState(newState)
				const wasJustCreatedNewLink = value?.justChangedLink ?? false
				const newMark = getMarksInSelection(newState).find(_ => _.type.name === self.name)
				const prevMark = getMarksInSelection(oldState).find(_ => _.type.name === self.name)

				const selectionSame = oldState.selection.eq(newState.selection)
				if (!selectionSame) {
					const wasOpen = value?.state ?? false
					const allowAutoOpenOnRecentlyChangedLink = value?.allowAutoOpenOnRecentlyChangedLink ?? false
					const considerUnchanged = allowAutoOpenOnRecentlyChangedLink && wasJustCreatedNewLink
					const changedMark = prevMark !== newMark && !considerUnchanged
					if ((value?.autoOpen ?? false) && newMark) {
						const newStateValue = changedMark
							? "open"
							: wasOpen
						const tr = newState.tr
						tr.setMeta(
							linkMenuPluginKey,
							{
								...value,
								state: newStateValue,
								justChangedLink: false,
								type: newMark.attrs.internal ? "internal" : "external"
							}
						)
						return tr
					} else {
						const tr = newState.tr
						tr.setMeta(
							linkMenuPluginKey,
							{
								...value,
								state: false,
								justChangedLink: false,
								type: undefined
							}
						)
						return tr
					}
				}
				return undefined
			},
			state: {
				init() {
					return {
						state: false,
						justChangedLink: false,
						type: undefined,
						autoOpen: true,
						allowAutoOpenOnRecentlyChangedLink: true
					}
				},
				apply: createStateOnlyPluginObjApply(linkMenuPluginKey)
			}
		})
		return [
			...((this as any).parent?.() ?? []).filter((plugin: PluginSpec<any>) => (plugin.spec.key !== linkMenuPluginKey && plugin.spec.key !== directLinkClickWithModifierPluginKey)),
			linkMenuStatePlugin,
			directLinkClickWithModifierPlugin
		]
	}
})

export type MarkLinkName = "link"
