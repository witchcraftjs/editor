import type { PopupPositionModifier } from "@witchcraft/ui/types"

/**
	* Modifes the popup to have a max width and height if it doesn't fit in the window.
	*/
export const popupPositionModifier: PopupPositionModifier = (pos, _reference, popup, veil) => {
	if (popup.height > veil.height) {
		pos.maxHeight = veil.height
	}
	if (popup.width > veil.width) {
		pos.maxWidth = veil.width
	}
	return pos
}
