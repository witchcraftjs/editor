---
description: Testing patterns for the editor project using Vitest with ProseMirror documents
---

# Testing Patterns

## Setup

- Use `setupWrapper(doc, { documents })` from `./utils/setupWrapper.js` to mount a real tiptap editor in a test.
- Pass `pm.doc(...)` or an HTML string as the initial document.
- Always pass `{ documents }` with at least a `doc` entry containing HTML content and a `title`.

## Building Documents

- Use `pm` builders from `./utils/pm.js` (backed by `prosemirror-test-builder`).
- `pm.item(...)` generates a random `blockid` — use `pm.itemNoId(...)` in expected docs so `isPartiallyEqual` can match.
- Nest structure: `pm.doc(pm.list(pm.item(pm.paragraph("text"))))`

## Finding Positions

- Use `posByNode(doc, { type: "paragraph", textContent: "text", attrs: {}, insert: true })` from `./utils/posByNode.js`.
- `insert: true` returns the position *before* the found node (for inserting content before it).

## Assertions

- Compare documents with `isPartiallyEqual(actual.toJSON(), expected.toJSON())`.
- Call `.toJSON()` on both sides — `isPartiallyEqual` compares JSON structures.
- Use `expect(isPartiallyEqual(a, b)).to.equal(true)`.

## Simulating Drops

```ts
async function simulateDrop(editor: Editor, files: File[], pos: number) {
  return editor.commands.insertFile(files, pos)
}

function createFile(name: string, type: string, content: string) {
  const base64 = `data:image/png;base64,${btoa(content)}`
  return { file: new File([content], name, { type }), base64 }
}
```

## Lifecycle

- `await delay(testFileLoaderDelay + 1000)` to wait for file loaders to resolve.
- Always `c.unmount()` at the end of each test to clean up.

## File Pattern

- Place tests in `tests/`.
- Name: `<Feature>.e2e.spec.ts`.
- Import vitest with `import { describe, expect, it } from "vitest"`.
- Local relative imports must end with `.js` suffix.
