import type { Mark } from "@tiptap/pm/model"

export function getTextOrMarkLength(textOrMark: string | Mark) {
	if (typeof textOrMark === "string") {
		return textOrMark.length
	}
	const textNodes = (textOrMark as any).flat.map((_: any) => "text" in _ ? _.text.length : getTextOrMarkLength(_ as any)) as number[]
	return textNodes.reduce((a, b) => a + b, 0)
}
