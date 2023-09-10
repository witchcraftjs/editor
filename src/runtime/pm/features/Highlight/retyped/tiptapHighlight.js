/** Avoid importing the module directly to avoid interface merging. */
import { inputRegex as _inputRegex, pasteRegex as _pasteRegex } from "@tiptap/extension-highlight"

export const inputRegex = _inputRegex
export const pasteRegex = _pasteRegex
