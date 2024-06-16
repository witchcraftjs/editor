import { type PmPoint, type Point } from "../../types.js"


export function pointToPmPoint(point: Point): PmPoint {
	return { left: point.x, top: point.y }
}
