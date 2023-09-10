import type { IframeSourceParser } from "./IframeParsers.js"

import type { HTMLAttributesOptions } from "../../../types/index.js"

export interface IframeNodeOptions extends HTMLAttributesOptions {
	handlers: Record<string, IframeSourceParser>
}
