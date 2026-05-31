import type { InjectionKey, Ref } from "vue"

import type { HighlightJsLanguageInfo } from "./highlightJsInfo.js"

export const langsInfoInjectionKey = Symbol.for("@witchcraft/editor:langsInfoInjectionKey") as InjectionKey<Ref<HighlightJsLanguageInfo>>

export const codeBlockThemeIsDarkInjectionKey = Symbol.for("@witchcraft/editor:codeBlockThemeIsDarkInjectionKey") as InjectionKey<Ref<boolean>>
