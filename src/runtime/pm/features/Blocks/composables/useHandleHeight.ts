import { unreachable } from "@alanscodelog/utils/unreachable"
import { type Ref, ref } from "vue"

export function useHandleHeight(
	handlesEl: Ref<HTMLElement | null>
): { handleHeight: Ref<number>, recalculateHandleHeight: () => void } {
	const handleHeight = ref<number>(0)
	function recalculateHandleHeight(): void {
		if (!handlesEl.value) return
		const firstItemContent = handlesEl.value?.querySelector("*:not(.ProseMirror) li[data-node-view-content]")
		const firstChild = firstItemContent?.firstElementChild

		if (!firstItemContent || !(firstChild instanceof Element)) {
			return
			// unreachable()
		}

		const computedStyles = window.getComputedStyle(firstChild)
		const computedLineHeight = computedStyles.lineHeight
		try {
			const lineHeight = Number.parseInt(computedLineHeight.replace("px", ""), 10)
			handleHeight.value = lineHeight
		} catch {
			unreachable()
		}
	}
	return { handleHeight, recalculateHandleHeight }
}
