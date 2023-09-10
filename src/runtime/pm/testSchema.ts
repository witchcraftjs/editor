import { getSchema } from "@tiptap/core"
import type { Schema } from "@tiptap/pm/model"
import { VueNodeViewRenderer } from "@tiptap/vue-3"

import { BaseShortcuts } from "./features/BaseShortcuts/BaseShortcuts.js"
import FileLoaderNodeView from "./features/FileLoader/components/FileLoaderNodeView.vue"
import { FileLoader, type NodeFileLoaderName } from "./features/FileLoader/FileLoader.js"
import { TestFileLoaderHandler } from "./features/FileLoader/FileLoaderHandler/TestFileLoaderHandler.js"
import { extensions, type schema as baseSchema } from "./schema.js"

export const testExtensions = [
	FileLoader.extend({
		addOptions() {
			return {
				...(this as any).parent?.(),
				handler: TestFileLoaderHandler
			}
		},
		addNodeView() {
			// am having lint only issues
			return VueNodeViewRenderer(FileLoaderNodeView, {
				stopEvent() {
					return true
				},
				ignoreMutation() {
					return true
				}
			})
		}
	}),
	BaseShortcuts,
	...extensions
]
export const testSchema = getSchema(testExtensions) as typeof baseSchema & Schema<NodeFileLoaderName & "itemNoId">
