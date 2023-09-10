import { Node } from "@tiptap/pm/model"
/** For testing only, see testSchema.ts. */
export function stripBlockId(obj: any): string {
	if (obj instanceof Node && "attrs" in obj) {
		delete (obj as any).attrs.blockId
	} else {
		delete obj.blockId
	}
	return obj
}
