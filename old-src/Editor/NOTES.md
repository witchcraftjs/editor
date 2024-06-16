Prosemirror CheatSheet


Given
```
List
	A "li"
		B "p"
			C (text)
		B2 "p"
			C2(text)
	D "li"
		E "p"
			F (text)
```

# Given cursor is at end of F
To get node E: ??? how to get offsetting text node

To get position at start of F
```ts
state.doc.resolve($from.pos - $from.parentOffset).pos
```
To get position at end of F
```ts
$from.pos
// or
state.doc.resolve($from.before($from.depth + 1)).pos
```


To get node E:
```ts
$from.node()
```
To get position at start of E:
```ts
//same as start of F:
state.doc.resolve($from.pos - $from.parentOffset).pos
// or
state.doc.resolve($from.before($from.depth) + 1).pos
```
To get position at end of E:
```ts
// end of F + 1
state.doc.resolve($from.before($from.depth + 1)).pos + 1
// or
state.doc.resolve($from.before($from.depth) + $from.node(-1).nodeSize - 2).pos
```

To get node D:
```ts
$from.node(-1)
// or
state.doc.resolve($from.before($from.depth)).node()
```
To get position at start of D:
```ts
state.doc.resolve($from.before($from.depth)).pos
```
To get position at end of D:
```ts
state.doc.resolve($from.before($from.depth) + $from.node(-1).nodeSize - 1).pos
```

To get node List:
```ts
$from.node(-2)
// or
state.doc.resolve($from.before($from.depth - 1)).node()
```
To get position at start of List:
```ts
state.doc.resolve($from.before($from.depth - 1)).pos
```
To get position at end of List:
```ts
state.doc.resolve($from.before($from.depth - 1) + $from.node(-1).nodeSize - 1).pos
```

To get node A (when A might be preceded by other items):
```ts
state.doc.resolve($from.before($from.depth - 1)).nodeBefore
// minus 2 because although -1 would be the end of A, .node() would return D
```
To get position at start of A:
```ts
let liD_start = state.doc.resolve($from.before($from.depth)).pos
let liD_end = state.doc.resolve($from.before($from.depth - 1) + $from.node(-1).nodeSize - 1).pos
let List_size = $from.node(-2).nodeSize
let offset = $from.textOffset
let right_offset_from_List = liD_end - (liD_start + offset)
let pos = (liD_start + offset + right_offset_from_List) - List_size + 3
```
To get position at end of A:


Note that doing this from, for example, C, would give the root node instead.

To get node B:
```ts
get_a.firstChild()
```
To get node B2:
```ts
get_a.lastChild()
```
