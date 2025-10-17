import { DROP_X, DROP_Y, type DropInfo } from "./dropPointInfo.js"

import type { Point } from "../../types/index.js"

export interface DropIndicator extends Point {
	width: number
	type: "child" | "before" | "after"
}

// todo move to ui lib
/**
 * Calculates the position and type of the drop indicator based on the pointer coordinates
 * and the target element's bounding rectangle.
 */
export function createDropIndicator(
	/** The drop point information object. */
	dropInfo: DropInfo,
	/** The bounding rectangle of the element being dragged over. It will be used for positioning the indicator and constraining it's width `(target.x < indicator < target.right)`. */
	targetRect: DOMRect,
	/**
	 * Determines the additional indentation to add when indicating a child drop operation. You normally want this to be the indentation of the dragged item.
	 *
	 * Can be gotten with {@link getElPropertyAsInt}, see it for details.
	 */
	indentX: number,
	/** Maximum width of the drop indicator. See {@link getElMaxVisualSize}. */
	maxWidth: number
): DropIndicator | undefined {
	const d = dropInfo

	let dropIndicator: DropIndicator | undefined

	const inBottomHalf = d.y === DROP_Y.BOTTOM || d.y === DROP_Y.OUTSIDE_BOTTOM
	const toRightOfIndent = d.x === DROP_X.INSIDE_INDENT || d.x === DROP_X.OUTSIDE_RIGHT

	if (toRightOfIndent && inBottomHalf) {
		dropIndicator = {
			type: "child",
			x: targetRect.x + indentX,
			y: targetRect.y + targetRect.height,
			width: maxWidth
		}
	} else {
		if (inBottomHalf) {
			dropIndicator = {
				type: "after",
				x: targetRect.x,
				y: targetRect.y + targetRect.height,
				width: maxWidth
			}
		} else {
			dropIndicator = {
				type: "before",
				x: targetRect.x,
				y: targetRect.y,
				width: maxWidth
			}
		}
	}

	const rightDiff = (dropIndicator.x + dropIndicator.width) - (targetRect.right)

	if (rightDiff > 0) {
		dropIndicator.width -= rightDiff
	}
	return dropIndicator
}
