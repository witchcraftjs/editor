import type { PopupPositioner } from "@witchcraft/ui/types"

/**
	* Position the popup so it's top edge is at the item's top edge, UNLESS it hits the top  or bottom edges, in which case it'll shift the positioning, always keeping the top of the menu in view.
	*/
export const popupVerticalPositioner: PopupPositioner = (reference, popup, veil, space) => {
	if (!reference) return 0
	const spaceBottomFromReferenceTop = (veil.y + veil.height) - reference.y
	if (space.top <= 0 || (space.top + reference.width + space.bottom) <= popup.height) {
		return 0
	} else if (spaceBottomFromReferenceTop > popup.height) {
		return reference.y
	} else {
		return veil.y + veil.height - popup.height
	}
}
