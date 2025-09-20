[![Docs](https://github.com/witchcraftjs/editor/workflows/Docs/badge.svg)](https://github.com/witchcraftjs/editor/actions/workflows/docs.yml)
[![Release](https://github.com/witchcraftjs/editor/actions/workflows/release.yml/badge.svg)](https://github.com/witchcraftjs/editor/actions/workflows/release.yml)
[![NPM Version (with latest tag)](https://img.shields.io/npm/v/%40alanscodelog%2FREPONAME/latest)](https://www.npmjs.com/package/@witchcraft/editor/v/latest)
# [Docs](https://witchcraftjs.github.io/editor)
# [Demo](https://witchcraftjs.github.io/editor/demo)

# @witchcraft/editor
This is a custom block based tiptap/prosemirror edtior for a note app I'm making. It takes inspiration from features of notion, workflowy, and obsidian.

## Features
- All blocks can be indented an infinite amount.
- Blocks are list items and support having custom states (checked, unchecked, partially checked, etc). Embedded/Transclusion of partial/full documents via nested editors. DocumentApi for loading state and syncronizing multiple editors, including nested ones.
- Internal/External link support.
- Code block support with async language and theme loading.
- Embed/iFrame support with custom/customizable handlers (i.e. not just youtube).
- Custom plugin nodes. The note app requires some way to safely allow plugins to create custom nodes with custom state. This provides an interface for doing that.
- Dark theme support.
- Unfocused selection preservation.
- Code like unindenting of blocks (selectiong will keep unindenting until flat).

The schema is quite simple:

BlockItems only support having a single block node type inside them and a BlockList for nesting.
```
Doc
	BlockList (as ul)
		BlockItem (as li)
			Block Like Nodes (Paragraph, Heading, etc)
			BlockList
				...
```

## Limitations

Unlike other block editors there is no real concept of ordered/unordered lists. Items themselves can have state but not lists. This might seem strange and is a bit weird for now in terms of serialization to regular html, but is incredibly flexible writing wise.

It's also not designed to be serializable to markdown. There's just no way to do that for nested blocks like this, and having to have everything serializable to markdown is extremely limiting.

I've tried to keep the features as seperated and compatible as possible, but it requires a lot of custom functionality. It makes very little use of existing tiptap/prosemirror nodes/commands as they are often not compatible.

# Installation

The package makes use of my component's library [@witchcraft/ui](https://github.com/@witchcraft/ui) for components and theming (through my theming library [metamorphosis](https://github.com/alanscodelog/metamorphosis)). They use a custom set of tailwind colors for easier application theming (e.g. \*-accent) though you could alternatively configure the colors manually in the tailwind config and not use the library (see below).

The components library explains how to configure anything, you just need to add this library's utility types to your tailwind file: 

```css [~/assets/css/tailwind.css]
@import "@tailwindcss" source("../../../app");
// using Nuxt:
@import "../../../.nuxt/witchcraft-ui.css";
// this takes care of sourcing the components
@import "../../../.nuxt/witchcraft-editor.css";

//without Nuxt:
@import "@witchcraft/ui/utils.css";
@import "@witchcraft/ui/base.css";
// source used components
@source "/path/to/node_modules/@witchcraft/ui/src/runtime/components";

@import "@witchcraft/editor/base.css";
@source "/path/to/node_modules/@witchcraft/editor/src/runtime/components";
@source "/path/to/node_modules/@witchcraft/editor/src/runtime/pm/features";
```

# Usage

An example of how to setup the editor for full use of all it's features is in [src/runtime/demo/App.vue](src/runtime/demo/App.vue).

Note that the default editor does not load any shortcuts as extensions have all been purposely created without them. You can import the extensions from the schema and add the BaseShortcuts extension to load some basic shortcuts.
 
# Only Using Extensions / Usage with Custom Editor Wrapper Component

The editor is batteries included and requires most of it's parts to work as intended. Some extensions can be easily used on their own, but many have a lot of interop and setup that must be done.

If using your own Editor component, some extensions like `EmbeddedDocument` require some extra work to setup, such as having the app or wrapping edtior component provide certain variables and apis. How much you can customize them and how to do it is documented by each extension.

Some plugins need to specify a special `stateInit` function that is called when using the document api when loading state without a view for when we need to change state on initialization (e.g. assign missing ids), see the class for details.

# Package Structure

```
src/
	App.vue - example usage / for dev
	components/
		Editor.vue - editor wrapper component
		Commands.vue - commands component
	composables/ - other composables, not strictly prosemirror related
	pm/ - prosemirror related
		schema.ts - the extentions list and schema
		utils/ - misc utils, not related to any specific command/extension
			internal/ - utils that are not exposed by the library
		commands/ - misc commands, contains some of the base commands that had to be rewritten (e.g. backspace, enter)
		features/ - the various extensions and pieces of functionality
			[name]/ Each typically contains a structure like the following:
				[name].ts - the extension/s or some other main functionality, documentation describing usage is usually here
				types.ts - related types and injection keys
				*NodeView.vue - the extension's node view if it has one
				components/ - components used by the node view or components (like bubble menus) that should be provided to the wrapper editor if using a custom one, see extension for details 
				commands/ - the commands registered by the extension
				composables/ - some extensions require the root editor or it's node views to use certain composables
				build/ - some features require a custom build step for code generation
				utils/ - related utils
				plugins/ - related plugins registered by the extension, most create them inside the extensions themselves to have easier access to the extension's options, but some are pretty standalone or too big
```

# Dev Notes

- Be very careful passing things from vue to tiptap/prosemirror. The reactive wrappings can break a lot of things.
- If making an editor it MUST use the import from `@tiptap/vue-3` and not `@tiptap/core` as the former will mark itself with vue's markRaw so it doesn't accidentally become reactive.
- Be careful when applying steps/transactions across different editor instances. They do not share the same schema instance and are therefore considered incompatible for many operations. Likeliest cause of "invalid content" errors.
- Invalid node content errors while testing are likely the result of using an invalid doc since the builder nodes are not created and filled. For example, items require some content (e.g. a paragraph).

