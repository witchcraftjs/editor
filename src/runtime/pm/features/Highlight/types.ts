import { PluginKey } from "@tiptap/pm/state"

import type { HTMLAttributesOptions } from "../../../types/index.js"

export interface HighlightMarkOptions<T extends string = `slot${[1, 2, 3, 4, 5][number]}`> extends HTMLAttributesOptions {
	/**
	 * The colors to use for the highlight in Record<name, {color: string, name: string}> format.
	 *
	 * This is to allow the colors/slots to be configurable by the user without needing to change the document when they do so since only the key is stored.
	 *
	 * The value is a record to allow additional properties to be stored.
	 *
	 * The `matches` property can be used to specify an additional array of strings/colors to match when parsing HTML.
	 *
	 * The default is Record<"slotX", {color: "rgbaa(...)", name: "colorName", matches?: [name, "#color"]}>
	 */
	colors: Record<T, { color: string, name: string, matches?: string[] }>
	/**
	 * For when a non-matching color is found in the HTML. Default is slot1 which is yellow.
	 */
	defaultColor: T
}
export const highlightPluginKey = new PluginKey<{
	colors: HighlightMarkOptions["colors"]
}>("highlightPluginKey")
