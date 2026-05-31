import type { useScrollNearContainerEdges } from "@witchcraft/ui/composables/useScrollNearContainerEdges"
import type { ComputedRef, InjectionKey } from "vue"

import type { CssVariables } from "./types/index.js"

export const editorCssVariablesInjectionKey = Symbol.for("@witchcraft/editor:editorCssVariablesInjectionKey") as InjectionKey<ComputedRef<CssVariables>>

export const editorScrollInjectionKey = Symbol.for("@witchcraft/editor:editorScrollInjectionKey") as InjectionKey<ReturnType<typeof useScrollNearContainerEdges>>

export const editorTeleportToInjectionKey = Symbol.for("@witchcraft/editor:editorTeleportToInjectionKey") as InjectionKey<string>
