import type { Point } from "../types.js"


export function pointInBox(point: Point, box: Point & { width: number, height: number }): boolean {
	if (point.x >= box.x && point.x <= box.x + box.width &&
		point.y >= box.y && point.y <= box.y + box.height) {
		return true
	}
	return false
}
