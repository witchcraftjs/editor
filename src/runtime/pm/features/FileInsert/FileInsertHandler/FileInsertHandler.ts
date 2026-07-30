import type { Editor } from "@tiptap/core"
import type { Node } from "@tiptap/pm/model"
import { insertPoint } from "@tiptap/pm/transform"
import { nanoid } from "nanoid"

import { findPlaceholder, placeholderPluginKey } from "../plugins/placeholderPlugin.js"
import type { IFileInsertHandler } from "../types.js"

/**
 * Maps insert IDs to their batch info for position adjustment during concurrent replacements.
 * Keyed by insertId (which becomes the file node's `id` attr after replacement).
 */
interface BatchEntry {
	batchId: string
	batchIndex: number
}

/**
 * A partial implementation of {@link IFileInsertHandler}.
 *
 * Extend it to use it and define the `saveFile` method. Everything else has a default implementation (but they can be overridden as needed).
 *
 * To identify each placeholder and fetch it again once the file is uploaded, it uses a 10 character nanoid.
 */
export class FileInsertHandler<
	TFile extends File = File,
	T extends { file: TFile, result: string | ArrayBuffer | null } = { file: TFile, result: string | ArrayBuffer | null },
	TKey = string
> implements IFileInsertHandler<TFile, T, TKey> {
	/** Maps insert IDs to their batch info for position adjustment during concurrent replacements. */
	insertionBatch = new Map<string, BatchEntry>()

	/**
	 * Look up batch info for an insert ID.
	 *
	 * @returns batch info or undefined if not tracked
	 */
	protected getBatchInfo(insertId: string): BatchEntry | undefined {
		return this.insertionBatch.get(insertId)
	}

	saveFile(_file: TFile, _insertId: TKey, _editor: Editor): Promise<T | undefined> {
		throw new Error("saveFile must be implemented by subclass")
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

	/** Removes the placeholder decoration by ID. */
	onSaveError(_file: TFile, editor: Editor, _pos: number | undefined, _error: Error, loadingKey: TKey): void {
		editor.commands.command(({ tr }) => {
			tr.setMeta(placeholderPluginKey, { remove: { id: String(loadingKey) } })
			return true
		})
	}

	/**
	 * Adds a widget decoration at the insert position. It uses a nanoid for the loading id.
	 */
	insertAsyncPlaceholder(file: TFile, editor: Editor, insertPos: number, _originalPos?: number): TKey {
		const loadingId = nanoid(10)
		editor.commands.command(({ tr }) => {
			const $pos = tr.doc.resolve(insertPos)
			if ($pos.parent.inlineContent) {
				// inline: add widget decoration directly at position
				tr.setMeta(placeholderPluginKey, {
					add: {
						id: loadingId,
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
							id: loadingId,
							pos: decoPos,
							fileName: file.name,
							side: -1
						}
					})
				}
			}
			return true
		})
		return loadingId as TKey
	}

	/**
	 * Replace a placeholder decoration with a file node.
	 *
	 * Handles both inline (replace at position) and block (replace paragraph content) contexts.
	 */
	replacePlaceholder(editor: Editor, pos: number, res: T, loadingKey: TKey): void {
		if (editor.isDestroyed) return

		const pm = editor.schema.nodes
		const result = res.result

		editor.commands.command(({ tr }) => {
			// only create file node if we have a string result
			if (typeof result === "string") {
				const adjustedPos = this.adjustInsertPosition(tr.doc, pos, String(loadingKey))
				const $pos = tr.doc.resolve(adjustedPos)

				const attrs = { src: result, id: String(loadingKey) }

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
			}

			tr.setMeta(placeholderPluginKey, { remove: { id: String(loadingKey) } })
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
		insertId: string
	): number {
		const myBatch = this.getBatchInfo(insertId)
		if (myBatch == null) {
			return pos
		}
		const siblings: Array<{ batchIndex: number, pos: number, nodeSize: number }> = []

		// scan backwards
		doc.nodesBetween(0, pos, (node, p) => {
			if (node.type.name === "file") {
				const nodeId = node.attrs.id
				const siblingBatch = this.getBatchInfo(nodeId)
				if (siblingBatch && siblingBatch.batchId === myBatch.batchId && nodeId !== insertId) {
					siblings.push({ batchIndex: siblingBatch.batchIndex, pos: p, nodeSize: node.nodeSize })
				}
			}
			return true
		})

		// scan forwards
		doc.nodesBetween(pos, doc.content.size, (node, p) => {
			if (node.type.name === "file") {
				const nodeId = node.attrs.id
				const siblingBatch = this.getBatchInfo(nodeId)
				if (siblingBatch && siblingBatch.batchId === myBatch.batchId && nodeId !== insertId) {
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
		const insertEntries: Array<{ file: TFile, insertId: TKey, batchIndex: number }> = []
		const batchId = nanoid(10)
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

			const insertId = this.insertAsyncPlaceholder(f, editor, insertPosition, pos)
			if (!insertId) continue

			// register batch info upfront so adjustInsertPosition can find it during replacement
			this.insertionBatch.set(String(insertId), { batchId, batchIndex })

			insertEntries.push({ file: f, insertId, batchIndex })
		}

		// save files concurrently, then replace placeholder by ID
		await Promise.allSettled(insertEntries.map(async entry => {
			const { file, insertId } = entry

			const res = await this.saveFile(file, insertId, editor)
			if (!res) {
				return this.onSaveError(file, editor, undefined, new Error("saveFile returned nothing."), insertId)
			}

			const replacePos = findPlaceholder(editor.state, String(insertId))
			if (!replacePos) {
				return this.onSaveError(file, editor, replacePos, new Error("Could not find node to replace."), insertId)
			}

			this.replacePlaceholder(editor, replacePos, res, insertId)
		}))

		// cleanup batch maps
		for (const entry of insertEntries) {
			this.insertionBatch.delete(String(entry.insertId))
		}
	}
}
