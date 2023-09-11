<template>
<div
	:style="`padding-left:calc(${level}*10px);white-space:pre-wrap;`"
	:level="level"
	v-html="content"
/>
<template v-if="children && children.length > 0">
	<list
		:level="level + 1"
		:name="child.name"
		:children="child.children"
		v-for="(child, index) in children"
		:key="index"
	/>
</template>
</template>

<script lang="ts" setup>
import type { DevListItem } from "../types.js"
import { computed, type PropType } from "vue"


const props = defineProps({
	name: { required: true, type: String, default: "" },
	level: { required: false, type: Number, default: 0 },
	children: { required: false, type: Array as PropType<DevListItem[]>, default: undefined },
})

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
</script>
