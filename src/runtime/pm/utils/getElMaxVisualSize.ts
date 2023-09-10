// todo move to ui lib

/**
 * Gets the visual width and height of an element (el.getBoundingClientRect().width/height - scrollbarWidth/Height).
 *
 * Useful for creating drop indicators that don't go outside the element.
 */
export function getElMaxVisualSize(el: HTMLElement): { width: number, height: number } {
	const scrollBarWidth = el.offsetWidth - el.clientWidth
	const width = el.getBoundingClientRect().width - scrollBarWidth
	const scrollBarHeight = el.offsetHeight - el.clientHeight
	const height = el.getBoundingClientRect().height - scrollBarHeight
	return { width, height }
}
