import { type Ref, ref } from "vue"

export function useHasChildren(listEl: Ref<HTMLElement | null>): {
	hasChildren: Ref<boolean>
	checkHasChildren: () => void
} {
	const hasChildren = ref(false)
	function checkHasChildren(): void {
		if (listEl.value) {
			hasChildren.value = listEl.value.querySelector("ul [node-type='list'], ol [node-type='list']") !== null
		}
	}
	return { hasChildren, checkHasChildren }
}
