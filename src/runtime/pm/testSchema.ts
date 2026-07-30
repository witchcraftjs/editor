import { getSchema } from "@tiptap/core"

import { BaseShortcuts } from "./features/BaseShortcuts/BaseShortcuts.js"
import { FileInsert } from "./features/FileInsert/FileInsert.js"
import { testFileInsertHandler } from "./features/FileInsert/FileInsertHandler/TestFileInsertHandler.js"
import { extensions, type schema as baseSchema } from "./schema.js"


export const testExtensions = [
	FileInsert.extend({
		addOptions() {
			return {
				...(this as any).parent?.(),
				handler: testFileInsertHandler
			}
		}
	}),
	BaseShortcuts,
	...extensions
]

export const testSchema = getSchema(testExtensions) as typeof baseSchema

