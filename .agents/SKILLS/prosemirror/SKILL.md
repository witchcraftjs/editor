---
title: prosemirror-documents
description: ProseMirror document model: structure, identity, data structures, indexing, slices, and changing documents. Use when working with ProseMirror docs, nodes, fragments, positions, or understanding how the document tree works. Applies to Tiptap projects (Tiptap is built on ProseMirror).
---

# ProseMirror Documents

## Structure

A ProseMirror document is a `Node` holding a `Fragment` of zero or more child nodes. Recursive, tree-shaped — like the browser DOM, but different for inline content.

In HTML, inline markup is a nested tree:
```html
<p>This is <strong>strong text with <em>emphasis</em></strong></p>
```

In ProseMirror, inline content is a **flat sequence** with markup as metadata (marks) on the nodes. This means:
- Positions in a paragraph use character offsets, not tree paths
- One valid representation: adjacent text nodes with same marks are always combined, empty text nodes not allowed
- Mark order specified by schema

Document = tree of block nodes. Most leaf nodes are **textblocks** (block nodes containing text). Can also have empty leaf blocks (horizontal rule, video).

Node properties reflecting role: `isBlock`, `isInline`, `inlineContent`, `isTextblock`, `isLeaf`.

## Identity and Persistence

Nodes are **values**, not stateful objects with identity. Like the number 3 — can appear in multiple structures, has no parent link, operations produce new values without changing the original.

Every update produces a new document value that shares unchanged sub-nodes with the original (cheap). Benefits:
- Impossible to have invalid in-between state during update
- Easier to reason about mathematically
- Enables collaborative editing
- Efficient DOM update algorithm (compare last doc to current)

**Never mutate nodes, fragments, marks, or their internal arrays/objects.** They are shared between multiple data structures. Mutating them will cause things to break.

## Data Structures

```
Node
  type: NodeType       # knows name, valid attrs, etc.
  content: Fragment    # [Node, Node, ...] (even empty nodes get Fragment.empty)
  attrs: Object        # extra values (e.g., image alt text, URL)
  marks: [Mark, ...]   # inline nodes only (emphasis, link, etc.)

Mark
  type: MarkType
  attrs: Object
```

Full document = a node. Content = top-level node's children (typically block nodes, some containing inline content). Top-level node can also be a textblock (inline-only doc).

Create nodes through schema:
```ts
let doc = schema.node("doc", null, [
  schema.node("paragraph", null, [schema.text("One.")]),
  schema.node("horizontal_rule"),
  schema.node("paragraph", null, [schema.text("Two!")])
])
```

## Indexing

Two indexing modes:

**Tree** — `node.child(i)`, `node.childCount`, `node.descendants(fn)`, `node.nodesBetween(from, to, fn)`

**Flat token positions** — any document position is an integer (index in token sequence). Tokens don't exist in memory — it's a counting convention made cheap by the tree shape.

- Start of document = position 0
- Entering/leaving a non-leaf node = 1 token each
- Each text character = 1 token
- Leaf nodes (no content) = 1 token

Example:
```
<p>One</p>                    <blockquote><p>Two<img></p></blockquote>
0 1 2 3 4 5                  5 6 7 8 9 10 11 12 13
 <p> O n e </p>             <blockquote> <p> T w o <img> </p> </blockquote>
```

For the outer document node: size is `doc.content.size`, **not** `doc.nodeSize` (open/close tokens not part of the document — can't put cursor outside it).

Use `node.resolve(pos)` to get a `ResolvedPos` (parent node, offset into parent, depth, ancestors).

**Distinguish:** child indices vs document-wide positions vs node-local offsets.

## Slices

A slice = content between two positions. Differs from a full node/fragment because nodes at start or end may be **open** (incomplete).

Example: selecting from middle of one paragraph to middle of the next gives a slice with two paragraphs, first open at start, second open at end. Open nodes may violate schema constraints if treated as full content.

`Slice` stores a `Fragment` + `openStart` / `openEnd` depth. Cut with `node.slice(from, to)`.

```ts
let slice1 = doc.slice(0, 3)  // first paragraph: openStart=0, openEnd=0 (closed)
let slice2 = doc.slice(1, 5)  // across paragraphs: openStart=1, openEnd=1 (open)
```

## Changing

Nodes and fragments are persistent — **never mutate them**. Use transforms for editor state updates.

For manual document derivation:
- `node.replace(range, slice)` — replace a range with new content (usual way to update a whole doc)
- `node.copy(content)` — shallow copy with new content
- `fragment.replaceChild(i, node)` — replace one child
- `fragment.append(nodes)` — append to fragment

## References

Read more here (careful read only that heading, the docs is huge): https://prosemirror.net/docs/guide/#doc
