/* eslint-disable */
import { keys } from "@alanscodelog/utils/keys"

/**
 * This is an auto-generated file.
 *
 * Do not edit manually.
 *
 * See build/utils/generateHighlightJsInfo.js
 */

type LanguageState = Record<string, { loaded: boolean, aliases: string[] }>

export type HighlightJsLanguageInfo = {
	languages: LanguageState
	aliases: Record<string, string>
}

const rawLanguages: Record<string, Partial<LanguageState[string]>> = {
	"1c": {},
	"abnf": {},
	"accesslog": {},
	"actionscript": {
		"aliases": [
			"as"
		]
	},
	"ada": {},
	"angelscript": {
		"aliases": [
			"asc"
		]
	},
	"apache": {
		"aliases": [
			"apacheconf"
		]
	},
	"applescript": {
		"aliases": [
			"osascript"
		]
	},
	"arcade": {},
	"arduino": {
		"aliases": [
			"ino"
		]
	},
	"armasm": {
		"aliases": [
			"arm"
		]
	},
	"xml": {
		"aliases": [
			"html",
			"xhtml",
			"rss",
			"atom",
			"xjb",
			"xsd",
			"xsl",
			"plist",
			"wsf",
			"svg"
		]
	},
	"asciidoc": {
		"aliases": [
			"adoc"
		]
	},
	"aspectj": {},
	"autohotkey": {
		"aliases": [
			"ahk"
		]
	},
	"autoit": {},
	"avrasm": {},
	"awk": {},
	"axapta": {
		"aliases": [
			"x++"
		]
	},
	"bash": {
		"aliases": [
			"sh",
			"zsh"
		]
	},
	"basic": {},
	"bnf": {},
	"brainfuck": {
		"aliases": [
			"bf"
		]
	},
	"c": {
		"aliases": [
			"h"
		]
	},
	"cal": {},
	"capnproto": {
		"aliases": [
			"capnp"
		]
	},
	"ceylon": {},
	"clean": {
		"aliases": [
			"icl",
			"dcl"
		]
	},
	"clojure": {
		"aliases": [
			"clj",
			"edn"
		]
	},
	"clojure-repl": {},
	"cmake": {
		"aliases": [
			"cmake.in"
		]
	},
	"coffeescript": {
		"aliases": [
			"coffee",
			"cson",
			"iced"
		]
	},
	"coq": {},
	"cos": {
		"aliases": [
			"cls"
		]
	},
	"cpp": {
		"aliases": [
			"cc",
			"c++",
			"h++",
			"hpp",
			"hh",
			"hxx",
			"cxx"
		]
	},
	"crmsh": {
		"aliases": [
			"crm",
			"pcmk"
		]
	},
	"crystal": {
		"aliases": [
			"cr"
		]
	},
	"csharp": {
		"aliases": [
			"cs",
			"c#"
		]
	},
	"csp": {},
	"css": {},
	"d": {},
	"markdown": {
		"aliases": [
			"md",
			"mkdown",
			"mkd"
		]
	},
	"dart": {},
	"delphi": {
		"aliases": [
			"dpr",
			"dfm",
			"pas",
			"pascal"
		]
	},
	"diff": {
		"aliases": [
			"patch"
		]
	},
	"django": {
		"aliases": [
			"jinja"
		]
	},
	"dns": {
		"aliases": [
			"bind",
			"zone"
		]
	},
	"dockerfile": {
		"aliases": [
			"docker"
		]
	},
	"dos": {
		"aliases": [
			"bat",
			"cmd"
		]
	},
	"dsconfig": {},
	"dts": {},
	"dust": {
		"aliases": [
			"dst"
		]
	},
	"ebnf": {},
	"elixir": {
		"aliases": [
			"ex",
			"exs"
		]
	},
	"elm": {},
	"ruby": {
		"aliases": [
			"rb",
			"gemspec",
			"podspec",
			"thor",
			"irb"
		]
	},
	"erb": {},
	"erlang-repl": {},
	"erlang": {
		"aliases": [
			"erl"
		]
	},
	"excel": {
		"aliases": [
			"xlsx",
			"xls"
		]
	},
	"fix": {},
	"flix": {},
	"fortran": {
		"aliases": [
			"f90",
			"f95"
		]
	},
	"fsharp": {
		"aliases": [
			"fs",
			"f#"
		]
	},
	"gams": {
		"aliases": [
			"gms"
		]
	},
	"gauss": {
		"aliases": [
			"gss"
		]
	},
	"gcode": {
		"aliases": [
			"nc"
		]
	},
	"gherkin": {
		"aliases": [
			"feature"
		]
	},
	"glsl": {},
	"gml": {},
	"go": {
		"aliases": [
			"golang"
		]
	},
	"golo": {},
	"gradle": {},
	"graphql": {
		"aliases": [
			"gql"
		]
	},
	"groovy": {},
	"haml": {},
	"handlebars": {
		"aliases": [
			"hbs",
			"html.hbs",
			"html.handlebars",
			"htmlbars"
		]
	},
	"haskell": {
		"aliases": [
			"hs"
		]
	},
	"haxe": {
		"aliases": [
			"hx"
		]
	},
	"hsp": {},
	"http": {
		"aliases": [
			"https"
		]
	},
	"hy": {
		"aliases": [
			"hylang"
		]
	},
	"inform7": {
		"aliases": [
			"i7"
		]
	},
	"ini": {
		"aliases": [
			"toml"
		]
	},
	"irpf90": {},
	"isbl": {},
	"java": {
		"aliases": [
			"jsp"
		]
	},
	"javascript": {
		"aliases": [
			"js",
			"jsx",
			"mjs",
			"cjs"
		]
	},
	"jboss-cli": {
		"aliases": [
			"wildfly-cli"
		]
	},
	"json": {
		"aliases": [
			"jsonc"
		]
	},
	"julia": {},
	"julia-repl": {
		"aliases": [
			"jldoctest"
		]
	},
	"kotlin": {
		"aliases": [
			"kt",
			"kts"
		]
	},
	"lasso": {
		"aliases": [
			"ls",
			"lassoscript"
		]
	},
	"latex": {
		"aliases": [
			"tex"
		]
	},
	"ldif": {},
	"leaf": {},
	"less": {},
	"lisp": {},
	"livecodeserver": {},
	"livescript": {
		"aliases": [
			"ls"
		]
	},
	"llvm": {},
	"lsl": {},
	"lua": {
		"aliases": [
			"pluto"
		]
	},
	"makefile": {
		"aliases": [
			"mk",
			"mak",
			"make"
		]
	},
	"mathematica": {
		"aliases": [
			"mma",
			"wl"
		]
	},
	"matlab": {},
	"maxima": {},
	"mel": {},
	"mercury": {
		"aliases": [
			"m",
			"moo"
		]
	},
	"mipsasm": {
		"aliases": [
			"mips"
		]
	},
	"mizar": {},
	"perl": {
		"aliases": [
			"pl",
			"pm"
		]
	},
	"mojolicious": {},
	"monkey": {},
	"moonscript": {
		"aliases": [
			"moon"
		]
	},
	"n1ql": {},
	"nestedtext": {
		"aliases": [
			"nt"
		]
	},
	"nginx": {
		"aliases": [
			"nginxconf"
		]
	},
	"nim": {},
	"nix": {
		"aliases": [
			"nixos"
		]
	},
	"node-repl": {},
	"nsis": {},
	"objectivec": {
		"aliases": [
			"mm",
			"objc",
			"obj-c",
			"obj-c++",
			"objective-c++"
		]
	},
	"ocaml": {
		"aliases": [
			"ml"
		]
	},
	"openscad": {
		"aliases": [
			"scad"
		]
	},
	"oxygene": {},
	"parser3": {},
	"pf": {
		"aliases": [
			"pf.conf"
		]
	},
	"pgsql": {
		"aliases": [
			"postgres",
			"postgresql"
		]
	},
	"php": {},
	"php-template": {},
	"plaintext": {
		"aliases": [
			"text",
			"txt"
		]
	},
	"pony": {},
	"powershell": {
		"aliases": [
			"pwsh",
			"ps",
			"ps1"
		]
	},
	"processing": {
		"aliases": [
			"pde"
		]
	},
	"profile": {},
	"prolog": {},
	"properties": {},
	"protobuf": {
		"aliases": [
			"proto"
		]
	},
	"puppet": {
		"aliases": [
			"pp"
		]
	},
	"purebasic": {
		"aliases": [
			"pb",
			"pbi"
		]
	},
	"python": {
		"aliases": [
			"py",
			"gyp",
			"ipython"
		]
	},
	"python-repl": {
		"aliases": [
			"pycon"
		]
	},
	"q": {
		"aliases": [
			"k",
			"kdb"
		]
	},
	"qml": {
		"aliases": [
			"qt"
		]
	},
	"r": {},
	"reasonml": {
		"aliases": [
			"re"
		]
	},
	"rib": {},
	"roboconf": {
		"aliases": [
			"graph",
			"instances"
		]
	},
	"routeros": {
		"aliases": [
			"mikrotik"
		]
	},
	"rsl": {},
	"ruleslanguage": {},
	"rust": {
		"aliases": [
			"rs"
		]
	},
	"sas": {},
	"scala": {},
	"scheme": {
		"aliases": [
			"scm"
		]
	},
	"scilab": {
		"aliases": [
			"sci"
		]
	},
	"scss": {},
	"shell": {
		"aliases": [
			"console",
			"shellsession"
		]
	},
	"smali": {},
	"smalltalk": {
		"aliases": [
			"st"
		]
	},
	"sml": {
		"aliases": [
			"ml"
		]
	},
	"sqf": {},
	"sql": {},
	"stan": {
		"aliases": [
			"stanfuncs"
		]
	},
	"stata": {
		"aliases": [
			"do",
			"ado"
		]
	},
	"step21": {
		"aliases": [
			"p21",
			"step",
			"stp"
		]
	},
	"stylus": {
		"aliases": [
			"styl"
		]
	},
	"subunit": {},
	"swift": {},
	"taggerscript": {},
	"yaml": {
		"aliases": [
			"yml"
		]
	},
	"tap": {},
	"tcl": {
		"aliases": [
			"tk"
		]
	},
	"thrift": {},
	"tp": {},
	"twig": {
		"aliases": [
			"craftcms"
		]
	},
	"typescript": {
		"aliases": [
			"ts",
			"tsx",
			"mts",
			"cts"
		]
	},
	"vala": {},
	"vbnet": {
		"aliases": [
			"vb"
		]
	},
	"vbscript": {
		"aliases": [
			"vbs"
		]
	},
	"vbscript-html": {},
	"verilog": {
		"aliases": [
			"v",
			"sv",
			"svh"
		]
	},
	"vhdl": {},
	"vim": {},
	"wasm": {},
	"wren": {},
	"x86asm": {},
	"xl": {
		"aliases": [
			"tao"
		]
	},
	"xquery": {
		"aliases": [
			"xpath",
			"xq",
			"xqm"
		]
	},
	"zephir": {
		"aliases": [
			"zep"
		]
	}
}

for (const lang of (keys(rawLanguages as any))) {
	(rawLanguages as any)[lang].loaded = false
}


export const highlightJsLanaguages: HighlightJsLanguageInfo = {
	languages: rawLanguages as any,
	aliases: Object.fromEntries(
		(keys(rawLanguages)
			.map(lang =>
				[
					...(rawLanguages[lang].aliases?.map(alias => [alias,lang]) ?? []),
					[lang, lang]
				]
			))
			.flat()
	)
}