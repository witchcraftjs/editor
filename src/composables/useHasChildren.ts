import { ref, type Ref } from "vue"

export function useHasChildren(listEl:Ref<HTMLElement|null>) {
	const hasChildren = ref(false)
	function checkHasChildren(): void {
		if (listEl.value) {
			hasChildren.value = listEl.value.querySelector("div [node-type='list']") !== null
		}
	}
	return {hasChildren, checkHasChildren}
}
