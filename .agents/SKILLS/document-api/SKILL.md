---
title: document-api
description: Use any time we are dealing with the document api (DocumentApi, useEditorContent, or anything that loads/saves/caches documents for editors).
---

# DocumentApi: per-doc vs per-view state

## Why the split exists

The `DocumentApi` keeps **one** `EditorState` per document in a cache (`_cache`, keyed by docId) to serve as the source of truth. There is **no** per-document editor instance — only one shared (headless) editor holds the schema and plugins. Then the real headful editors are created, each with their own state copy. They transmit transaction changes back to the cache state.


## What lives where

| Per document (DocumentApi) | Per view (useEditorContent) |
|---|---|
| `EditorState`, cached in `_cache[docId]` | `Editor` instance (view + own state) |
| load / save, debounced `save` | options from `preEditorInit` (per component) |
| `connectedEditors[docId]` list | `transaction` listener, update callback |
| refCounter (load/unload counts) | `selfSymbol`, attach/detach on mount/unmount |

The one shared editor is created in the `DocumentApi` constructor. On load, per document, the state is initialized by copying that editor's plugins so plugin state can be set up properly (a plugin's optional `stateInit` runs against a transaction from the loaded state). When an editor component mounts, `useEditorContent` calls `preEditorInit` to get a configuration for that component — it is per editor component and disconnected from the per-document configuration. After mount, `postEditorInit` runs once with the live editor so per-doc wiring can be attached to the view (e.g. `setCollabContext` / `setCollabBridge` commands register the per-doc collab bridge on the extension's storage).

## Loading a document

```text
1. View mounts, has docId
2. DocumentApi.load - once per document
   2a. check cache
       hit  → 2d
       miss → 2b. call load function with schema and plugins
              2c. run plugin stateInit on initial state
              2d. store state in cache
3. preEditorInit builds per-view options from cached state
4. view recreates its Editor with those options
5. connectEditor, attach listeners, then postEditorInit runs once
   (per-doc wiring onto the live editor, e.g. collab bridge commands)
```

Calling `load` multiple times for the same document is safe: the actual load function runs only once, but the refCounter is notified every time so it can track how many views use a document and unload it when no editor has it anymore.

## Synchronizing regular edits between editors and embeds

Every view listens to its own `transaction` events. When the doc changes, the view sends the transaction to `documentApi.updateDocument`. The api converts the steps against the cached full state (remapping offsets when the edit came from an embedded block), applies them, and stores the new state in the cache. Then it fires its `update` callbacks; each other view on the same document converts the transaction to its own schema and dispatches it into its editor. The view that made the edit is skipped via a per-view symbol, and every doc-changing update also triggers a debounced `save`.

```text
Editor view A → DocumentApi: 1. updateDocument with transaction
DocumentApi → State cache:   2. apply converted steps to cached state
DocumentApi → Editor view B: 3. update callback
Editor view B → itself:      4. convert steps to own schema and dispatch
```

Unloading a view calls `unload` (refCounter) and `disconnectEditor`, and removes the listeners. Once no views reference a document, the cache entry can be dropped — which is exactly why keeping state per document instead of per view keeps memory bounded by open documents, not mounted editors.

## Ground truth

- `src/runtime/pm/features/DocumentApi/DocumentApi.ts` (class + "How does it work" comment)
- `src/runtime/pm/features/DocumentApi/composables/useEditorContent.ts` (per-view side: load, preEditorInit, recreate, update listener)
- `src/runtime/pm/features/DocumentApi/composables/useTestDocumentApi.ts` (example of a per-doc load implementation)
