import { builders } from "prosemirror-test-builder"

import { testSchema } from "../../src/runtime/pm/testSchema.ts"
import { stripBlockId } from "../../src/runtime/pm/utils/internal/stripBlockId.js"

export const pm = builders(testSchema)
/** For testing only, creates an id-less item so it can be used with isPartiallyEqual. */
// @ts-expect-error .
pm.itemNoId = (...args: Parameters<typeof pm.item>) => stripBlockId(pm.item(...args))
