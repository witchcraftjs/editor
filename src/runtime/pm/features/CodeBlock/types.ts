import type { InjectionKey, Ref } from "vue"

import type { HighlightJsLanguageInfo } from "./highlightJsInfo.js"

export const langsInfoInjectionKey = Symbol("langsInfoInjectionKey") as InjectionKey<Ref<HighlightJsLanguageInfo>>

export const codeBlockThemeIsDarkInjectionKey = Symbol("codeBlockThemeIsDarkInjectionKey") as InjectionKey<Ref<boolean>>
