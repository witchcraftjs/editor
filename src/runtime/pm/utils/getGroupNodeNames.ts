import type { Schema } from "@tiptap/pm/model"

export function getGroupNodeNames(schema: Schema, groups: string[]): string[] {
	const res: string[] = []
	schema.spec.nodes.forEach((key, val) => {
		if (val.group && groups.includes(val.group)) res.push(key)
	})
	return res
}
