import type { Command } from "@tiptap/core"

declare module "@tiptap/core" {

	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Commands<ReturnType> {
		customEnter: {
			/**
			 * Overrides tiptap's enter command.
			 *
			 * @redirectable
			 */
			enter: (pos?: number) => ReturnType
		}
	}
}

export const enter = () => (pos?: number): Command =>
	({ commands }) => commands.first(({ commands }) => [
		// incase the command isn't registered
		() => commands?.blockquoteEnter(pos),
		// incase the command isn't registered
		() => commands?.codeBlockEnterOrSplit(pos),
		() => commands?.tableEnter(pos),
		() => commands.splitItem(pos),
		() => commands.insertBreak(pos)
	])
