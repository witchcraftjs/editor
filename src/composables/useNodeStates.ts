import type { Node } from "prosemirror-model"
import { computed, inject, type Ref } from "vue"

import { statesInjectionKey } from "../injectionKeys.js"


// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useNodeStates(props: { node: Node }) {
	const states = inject(statesInjectionKey)
	const counterStyle = computed(() => {
		if (props.node.attrs.type.startsWith("ordered-") ||
		props.node.attrs.type.startsWith("unordered-") ||
		props.node.attrs.type.startsWith("stateful-")
		) {
			return `${props.node.attrs.type.slice(props.node.attrs.type.indexOf("-") as number + 1)}`
		}

		if (props.node.attrs.type === "unordered") return "disc"
		if (props.node.attrs.type === "ordered") return "numeric"
		return ""
	})
	const nodeState = computed(() => {
		if (props.node.attrs.type.startsWith("stateful-") && counterStyle.value !== "") {
			return states?.value[counterStyle.value as keyof typeof states.value]?.entries
				.find(_ => _.value === props.node.attrs.state)
		}
		return undefined
	})

	return { counterStyle, nodeState }
}
