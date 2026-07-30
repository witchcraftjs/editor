import type { Node } from "@tiptap/core"
import type { Component, InjectionKey } from "vue"

/** Props passed to custom file view component. */
export type FileViewProps = {
	/** Only present for image files. */
	src?: string
	width?: number
	height?: number
	/** The node id (usually a nanoid from FileInserter). */
	id?: string
	/** By default the resize handles will set both width/height, but if rendering with a custom injected component, you might want some previews to control their own height. If so set this node property to true */
	ignoreAspectOnResize?: boolean
}

/** Attributes parsed from HTML when importing file/image nodes. */
export type ParsedFileAttrs = {
	src?: string
	id?: string
	width?: number
	height?: number
	ignoreAspectOnResize?: boolean
}


export interface FileNodeOptions {
/**
 * Decide whether to render this node as an `<img>` or `<div type="file">` in HTML output.
 * Default: always render as `<img>`.
 */
	renderHTMLAsImage: (node: Node) => true
	/**
	 * Called when parsing HTML for file/image nodes. Allows validating or modifying
	 * parsed attributes before the node is created. Return `false` to reject,
	 * `undefined` to accept as-is, or a partial attrs object to override values.
	 */
	onParseHTML?: (
	/** The raw DOM element being parsed. */
		dom: HTMLElement,
	/** The attrs extracted from the DOM element. */
		attrs: ParsedFileAttrs
	) => false | Partial<ParsedFileAttrs>
}


/**
 * Injection key for a custom file preview component.
 *
 * When provided, replaces the default `<img>` element inside FileNodeView.
 *
 * The component receives {@link FileViewProps} as props.
 */
export const fileViewInjectionKey = Symbol.for("@witchcraft/editor:fileViewInjectionKey") as InjectionKey<Component | undefined>

