import type { Rect } from "@/components/Editor/types"


export function styleElement(container: { left?: number, top?: number } | HTMLElement, rect: Rect, el?: HTMLElement): Rect {
	const _ = { ...rect }
	const offset = container instanceof Element ? container.getBoundingClientRect() : container
	if (_.top !== undefined && offset.top !== undefined) _.top -= offset.top
	if (_.left !== undefined && offset.left !== undefined) _.left -= offset.left
	if (!el) return _
	if (_.top !== undefined) el.style.top = `${_.top}px`
	if (_.left !== undefined) el.style.left = `${_.left}px`
	if (_.width !== undefined) el.style.width = `${_.width}px`
	if (_.height !== undefined) el.style.height = `${_.height}px`
	return _
}
