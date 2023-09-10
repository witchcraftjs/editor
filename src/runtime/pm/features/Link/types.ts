import type { MakeRequired } from "@alanscodelog/utils/types"
import type { LinkOptions } from "@tiptap/extension-link"
import { PluginKey } from "@tiptap/pm/state"

export interface AdditionalLinkOptions {

	/**
	 * Returns true if the given href is an internal link.
	 *
	 * Note this should check if the internal link is in a valid format and prevent xss attacks. Usually just making it a simple format is enough.
	 *
	 * The default one checks against the regex /internal:\/\/[0-9a-zA-Z_-]+/
	 */
	isInternalLink: (href: string) => boolean
	/**
	 * How to open internal links.
	 *
	 * The default is just to log the link to the console and warn to set the function which should be set with `setLinkOpts`
	 */
	openInternal: (href: string) => void
	/**
	 * How to open external links.
	 *
	 * The default is to open the link in a new tab.
	 *
	 * This can be changed using `setLinkOpts` to set a different function.
	 */
	openExternal: (href: string) => void
	openLinkOnClickModifier: "ctrlKey" | "shiftKey" | "altKey" | "metaKey"
}

export type EditorLinkOptions = MakeRequired<Partial<LinkOptions>, "openInternal">

export type LinkMenuPluginState = {
	state: "open" | "focus" | false
	justChangedLink: boolean
	type: "external" | "internal" | undefined
	autoOpen: boolean
	allowAutoOpenOnRecentlyChangedLink: boolean
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type DirectLinkClickPluginState = {
}

export const linkMenuPluginKey = new PluginKey<LinkMenuPluginState>("linkMenuState")
export const directLinkClickWithModifierPluginKey = new PluginKey<DirectLinkClickPluginState>("directLinkClickWithModifierPluginState")

declare module "../../../types/index.js" {
	interface MenuCloseCommands {
		closeLinkMenu: () => any
	}
}
