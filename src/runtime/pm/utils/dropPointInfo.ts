/* eslint-disable @typescript-eslint/no-use-before-define */
import type { EnumLike } from "@alanscodelog/utils"
import { enumFromArray } from "@alanscodelog/utils/enumFromArray"

import type { Point } from "../../types/index.js"

/**
 * Given a point (a mouse position), a box, and a possible indent, returns information regarding it's position.
 *
 * For example if we "zoom" in on a list section like this where the mouse is hovering at the level of B1 (not neccesarily inside it):
 *
 * ```
 * ...
 * 		- C1
 * 	- B1
 * - A1
 * ...
 * ```
 * We are interested in the following:
 * - In what y section we're in (outside-top, top, bottom, outside-bottom)
 * - In what x section we're in (outside-left, inside, inside-indent, outside-right)
 * ```
 *     outside-left \ inside       \ inside-indent \ outside-right
 *                  \              \               \
 * outside-top      \              \               \
 * -----------------┌──────────────┬───────────────┐
 *                  │B1            │               │
 *                  │              │               │
 * top              │              │               │
 * -----------------├──────────────┼───────────────┤
 *                  │<---indent--->│               │
 *                  │              │               │
 * bottom           │              │               │
 * -----------------└──────────────┴───────────────┘
 * outside-bottom
 * ```
 * We can use this information to determine where we want to drop something.
 */

// todo move to ui lib

export function dropPointInfo(
	point: Point,
	box: Point & { width: number, height: number },
	indentX: number
): DropInfo {
	const info: DropInfo = {
		x: "INSIDE",
		y: "TOP"
	}
	if (point.y < box.y) info.y = DROP_Y.OUTSIDE_TOP
	else if (point.y < (box.y + (box.height / 2))) info.y = DROP_Y.TOP
	else if (point.y < (box.y + box.height)) info.y = DROP_Y.BOTTOM
	else info.y = DROP_Y.OUTSIDE_BOTTOM

	if (point.x < box.x) info.x = DROP_X.OUTSIDE_LEFT
	else if (point.x < box.x + indentX) info.x = DROP_X.INSIDE
	else if (point.x < box.x + box.width) info.x = DROP_X.INSIDE_INDENT
	else info.x = DROP_X.OUTSIDE_RIGHT

	return info
}

export const DROP_Y = enumFromArray([
	"OUTSIDE_TOP",
	"TOP",
	"BOTTOM",
	"OUTSIDE_BOTTOM"
])

export type DropY = EnumLike<typeof DROP_Y>

export const DROP_X = enumFromArray([
	"OUTSIDE_LEFT",
	"INSIDE",
	"INSIDE_INDENT",
	"OUTSIDE_RIGHT"
])

export type DropX = EnumLike<typeof DROP_X>

export type DropInfo = {
	x: DropX
	y: DropY
}
