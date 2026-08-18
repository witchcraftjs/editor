import type { Editor } from "@tiptap/core"
import type { Node } from "@tiptap/pm/model"
import { insertPoint } from "@tiptap/pm/transform"
import { nanoid } from "nanoid"

import { findPlaceholder, placeholderPluginKey } from "../plugins/placeholderPlugin.js"
import type { IFileInsertHandler } from "../types.js"

/**
 * Maps insert IDs to their batch info for position adjustment during concurrent replacements.
 * Keyed by an id (which becomes the file node's `id` attr after replacement).
 */
interface BatchEntry {
	batchId: string
	batchIndex: number
}

/**
 * A partial implementation of {@link IFileInsertHandler}.
 *
 * To use it extend it and define the `saveFile` and `generatePreview` methods. Everything else has a default implementation (but they can be overridden as needed).
 *
 * To use a custom id generation strategy, override {@link generateId}.
 */
export class FileInsertHandler<
	TFile extends File = File,
	TAttrs extends Record<string, unknown> = Record<string, unknown>,
	T extends { file: TFile, attrs: TAttrs, previewSrc?: string } = { file: TFile, attrs: TAttrs, previewSrc?: string }
> implements IFileInsertHandler<TFile, TAttrs, T> {
	/** Maps insert IDs to their batch info for position adjustment during concurrent replacements. */
	insertionBatch = new Map<string, BatchEntry>()

	/**
	 * Look up batch info for an insert id.
	 *
	 * @returns batch info or undefined if not tracked
	 */
	protected getBatchInfoByInsertId(id: string): BatchEntry | undefined {
		return this.insertionBatch.get(id)
	}

	/**
	 * Generate a unique id for placeholders and batches.
	 *
	 * Override this method to use a custom id generation strategy.
	 *
	 * @default Uses a 10 digit nanoid.
	 */
	generateId(): string {
		const id = nanoid(10)
		return id
	}

	async saveFile(_file: TFile, _id: string, _editor: Editor, _previewSrc: string | undefined): Promise<T | undefined> {
		throw new Error("saveFile must be implemented by subclass")
	}

	async generatePreview(_file: TFile, _id: string, _editor: Editor): Promise<string | undefined> {
		throw new Error("generatePreview must be implemented by subclass")
	}

	filterFile(file: File): TFile | undefined {
		return file as TFile
	}

	/**
	 * Return the position if it's inline, otherwise finds position after the closest parent item node.
	 */
	insertPosition(_file: TFile, editor: Editor, pos?: number): number | undefined {
		const position = pos ?? editor.state.selection.anchor
		const doc = editor.state.doc
		const $pos = doc.resolve(position)
		// if cursor is in inline content, insert at cursor position
		if ($pos.parent.inlineContent) {
			return position
		}
		// use insertPoint to find the best position to insert an item node near pos
		const itemType = editor.schema.nodes.item
		const insertPos = insertPoint(doc, position, itemType)
		if (insertPos != null) {
			return insertPos
		}
		// fallback: return position directly (e.g., between items in a list)
		return position
	}

	/** Removes the placeholder decoration by id. */
	onSaveError(_file: TFile, editor: Editor, _pos: number | undefined, _error: Error, id: string): void {
		editor.commands.command(({ tr }) => {
			tr.setMeta(placeholderPluginKey, { remove: { id: id } })
			return true
		})
	}

	/**
	 * Adds a widget decoration at the insert position. Uses {@link generateId} for the loading id.
	 */
	insertAsyncPlaceholder(file: TFile, editor: Editor, insertPos: number, _originalPos?: number): string {
		const id = this.generateId()
		editor.commands.command(({ tr }) => {
			const $pos = tr.doc.resolve(insertPos)
			if ($pos.parent.inlineContent) {
				// inline: add widget decoration directly at position
				tr.setMeta(placeholderPluginKey, {
					add: {
						id: id,
						pos: insertPos,
						fileName: file.name,
						side: -1
					}
				})
			} else {
				// non-inline context: create a new item with a paragraph, then add decoration
				const pm = editor.schema.nodes
				const paragraph = pm.paragraph.createAndFill()
				if (paragraph) {
					const item = pm.item.create({}, paragraph)
					tr.insert(insertPos, item)
					// 1 + 1 for item + paragraph opens
					const decoPos = insertPos + 1 + 1
					tr.setMeta(placeholderPluginKey, {
						add: {
							id: id,
							pos: decoPos,
							fileName: file.name,
							side: -1
						}
					})
				}
			}
			return true
		})
		return id
	}

	/**
	 * Replace a placeholder decoration with a file node.
	 *
	 * Handles both inline (replace at position) and block (replace paragraph content) contexts.
	 */
	replacePlaceholder(
		editor: Editor,
		pos: number,
		attrs: Record<string, unknown>,
		id: string
	): void {
		if (editor.isDestroyed) return

		const pm = editor.schema.nodes

		editor.commands.command(({ tr }) => {
			const adjustedPos = this.adjustInsertPosition(tr.doc, pos, id)
			const $pos = tr.doc.resolve(adjustedPos)

			if ($pos.parent.inlineContent) {
				tr.replaceWith(adjustedPos, adjustedPos, pm.file.create(attrs))
			} else {
				const $inside = tr.doc.resolve(adjustedPos + 1)
				const paragraphPos = $inside.before($inside.depth)
				const paragraphEnd = $inside.after($inside.depth)
				const fileNode = pm.file.create(attrs)
				const newParagraph = pm.paragraph.create(null, fileNode)
				tr.replaceWith(paragraphPos, paragraphEnd, newParagraph)
			}

			tr.setMeta(placeholderPluginKey, { remove: { id: id } })
			return true
		})
	}

	/**
	 * Adjust the insert position based on batch info. Looks up batch info from insertionBatch
	 * and scans for sibling files from the same batch, returning the correct position.
	 */
	protected adjustInsertPosition(
		doc: Node,
		pos: number,
		id: string
	): number {
		const myBatch = this.getBatchInfoByInsertId(id)
		if (myBatch == null) {
			return pos
		}
		const siblings: Array<{ batchIndex: number, pos: number, nodeSize: number }> = []

		// scan backwards
		doc.nodesBetween(0, pos, (node, p) => {
			if (node.type.name === "file") {
				const nodeId = node.attrs.id
				const siblingBatch = this.getBatchInfoByInsertId(nodeId)
				if (siblingBatch && siblingBatch.batchId === myBatch.batchId && nodeId !== id) {
					siblings.push({ batchIndex: siblingBatch.batchIndex, pos: p, nodeSize: node.nodeSize })
				}
			}
			return true
		})

		// scan forwards
		doc.nodesBetween(pos, doc.content.size, (node, p) => {
			if (node.type.name === "file") {
				const nodeId = node.attrs.id
				const siblingBatch = this.getBatchInfoByInsertId(nodeId)
				if (siblingBatch && siblingBatch.batchId === myBatch.batchId && nodeId !== id) {
					siblings.push({ batchIndex: siblingBatch.batchIndex, pos: p, nodeSize: node.nodeSize })
				}
			}
			return true
		})

		if (siblings.length === 0) {
			return pos
		}

		siblings.sort((a, b) => a.pos - b.pos)

		// find the first sibling with higher batchIndex -> insert before it
		for (const sibling of siblings) {
			if (sibling.batchIndex > myBatch.batchIndex) {
				return sibling.pos
			}
		}

		// all siblings have lower batchIndex, insert after the last one
		const last = siblings[siblings.length - 1]
		return last.pos + last.nodeSize
	}

	/**
	 * Orchestrates the entire file insertion lifecycle: filter, insert placeholders,
	 * save files concurrently, replace placeholders, and cleanup batch maps.
	 *
	 * This is what the insertFiles command calls internally.
	 */
	async insertFiles(files: File[], editor: Editor, pos?: number): Promise<void> {
		// insert all placeholders synchronously (in reverse so they appear in original order)
		// batchIndex is assigned in original file order
		const insertEntries: Array<{ file: TFile, id: string, batchIndex: number }> = []
		const batchId = this.generateId()
		const reversedFiles = files.reverse()
		const totalFiles = reversedFiles.length

		for (const file of reversedFiles) {
			const f = this.filterFile(file)
			if (!f) continue

			const insertPosition = this.insertPosition(f, editor, pos)
			if (insertPosition === undefined) continue

			// assign batchIndex in original order: first file = 0, last file = N-1
			// since we iterate reversed, decrement from totalFiles - 1
			const batchIndex = totalFiles - reversedFiles.indexOf(file) - 1

			const id = this.insertAsyncPlaceholder(f, editor, insertPosition, pos)
			if (!id) continue

			// register batch info upfront so adjustInsertPosition can find it during replacement
			this.insertionBatch.set(id, { batchId, batchIndex })

			insertEntries.push({ file: f, id, batchIndex })
		}

		// save files concurrently, generate preview first, update placeholder, then replace
		await Promise.allSettled(insertEntries.map(async entry => {
			const { file, id } = entry

			// generate preview first so we can show it immediately
			const previewSrc = await this.generatePreview(file, id, editor)
			if (previewSrc && !editor.isDestroyed) {
				editor.commands.updateFilePreviewPlaceholder({ id: id, preview: previewSrc })
			}

			const res = await this.saveFile(file, id, editor, previewSrc)
			if (!res) {
				return this.onSaveError(file, editor, undefined, new Error("saveFile returned nothing."), id)
			}

			const replacePos = findPlaceholder(editor.state, id)
			if (!replacePos) {
				return this.onSaveError(file, editor, replacePos, new Error("Could not find node to replace."), id)
			}

			this.replacePlaceholder(editor, replacePos, res.attrs, id)
		}))

		// cleanup batch maps
		for (const entry of insertEntries) {
			this.insertionBatch.delete(entry.id)
		}
	}
}
