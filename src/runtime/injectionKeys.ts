import type { useScrollNearContainerEdges } from "@witchcraft/ui/composables/useScrollNearContainerEdges"
import type { ComputedRef, InjectionKey } from "vue"

import type { CssVariables } from "./types/index.js"

export const editorCssVariablesInjectionKey = Symbol("editorCssVariablesInjectionKey") as InjectionKey<ComputedRef<CssVariables>>

export const editorScrollInjectionKey = Symbol("editorScrollInjectionKey") as InjectionKey<ReturnType<typeof useScrollNearContainerEdges>>

export const editorTeleportToInjectionKey = Symbol("editorTeleportToInjectionKey") as InjectionKey<string>
