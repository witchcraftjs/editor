<template>
<div
	:node-type="nodeType"
	:style="`padding-left:10px;white-space:pre-wrap;`"
>
	<div ref="contentEl"/>
	<template v-if="children && children.length > 0">
		<div node-type="list">
			<list
				:name="child.name"
				:children="child.children"
				:node-type="child.type"
				v-for="(child, index) in children"
				:key="index"
			/>
		</div>
	</template>
</div>
</template>

<script lang="ts" setup>
import { computed, onMounted, type PropType, ref } from "vue"

import type { DevListItem } from "../types.js"


const props = defineProps({
	name: { required: true, type: String, default: "" },
	nodeType: { required: false, type: String, default: "none" },
	children: { required: false, type: Array as PropType<DevListItem[]>, default: undefined },
})

const contentEl = ref<HTMLElement | null>(null)
const content = computed(() => {
	const type = props.name!.match(/<.*?>/)
	const beginning = (type ? type : "<p>")
	const end = (type ? type[0].replace("<", "</") : "</p>")
	const center = props.name!.split("\n").map(line => {
		if (line.match(/<.*?>/)) {
			line = line.replace(/<.*?>/, "")
		}
		line.replace(/\s*/, "&nbsp;")
		return line
	}).join("<br/>")
	return [beginning, center, end].join("")
})
onMounted(() => {
	// todo fixed cursed hack
	contentEl.value!.outerHTML = content.value
})
</script>
