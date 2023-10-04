import type { InjectionKey, Ref } from "vue"

import type { StatefulNodeStates } from "./schema/stateful.js"
import type { CssVariables } from "./types.js"


export const statesInjectionKey = Symbol("statesInjectionKey") as InjectionKey<Ref< StatefulNodeStates >>
export const editorCssVariablesInjectionKey = Symbol("editorCssVariablesInjectionKey") as InjectionKey<Ref<CssVariables>>

export const editorStateInjectionKey = Symbol("editorGlobalStateInjectionKey") as InjectionKey<{
	isDragging: Ref<boolean>
	isUsingTouch: Ref<boolean>
}>
