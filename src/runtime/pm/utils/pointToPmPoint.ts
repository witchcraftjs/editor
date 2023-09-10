import type { PmPoint, Point } from "../../types/index.js"

export function pointToPmPoint(point: Point): PmPoint {
	return { left: point.x, top: point.y }
}
