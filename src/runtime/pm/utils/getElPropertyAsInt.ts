const pxRegex = /([0-9.]+)px/g
/**
 * Returns any **pixel** css property as an integer.
 */
export function getElPropertyAsInt(el: HTMLElement, prop: string): number {
	const value = window.getComputedStyle(el).getPropertyValue(prop)
	if (!pxRegex.test(value)) {
		throw new Error(`Component must set property ${prop} in pixels for getElPropertyAsInt to be able to extract the value.`)
	}
	return Number.parseInt(value.replace(pxRegex, "$1"), 10)
}
