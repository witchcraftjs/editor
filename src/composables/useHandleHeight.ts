import {unreachable} from"@alanscodelog/utils"
import { ref, type Ref } from "vue"

export function useHandleHeight(
	handlesEl: Ref<HTMLElement | null>,
listEl: Ref<HTMLElement | null>,
) {
	const handleHeight = ref<number>(0)
	function recalculateHandleHeight () {
		if (!handlesEl.value) return
		const firstChild = listEl.value?.querySelector("div [data-node-view-content]")?.firstElementChild
		if (!firstChild || !(firstChild instanceof Element)) {
			// eslint-disable-next-line no-console
			console.log("That's very weird")
			return
		}
		const computedStyles = window.getComputedStyle(firstChild)
		const computedLineHeight = computedStyles.lineHeight
		try {
			const lineHeight = parseInt(computedLineHeight.replace("px", ""), 10)
			handleHeight.value = lineHeight
			return
		} catch (e) {
			unreachable()
		}
	}
	return {handleHeight, recalculateHandleHeight}
}
