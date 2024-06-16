<template>
	<div class="item" :level="level" v-html="content"/>
	<template v-if="children_l && children_l.length > 0" style="white-space:pre-wrap;">
		<list
			:level="level + 1"
			:name="child.name"
			:children_l="child.children"
			v-for="(child, index) in children_l"
			:key="index"
		/>
	</template>
</template>

<script lang="ts">
import { defineComponent } from "vue"


export default defineComponent({
	name: "list",
	props: {
		name: { required: true, type: String, default: "" as string },
		level: { required: false, type: Number, default: 0 as number },
		children_l: Array,
	},
	computed: {
		content(): string {
			let type = this.name!.match(/\<.*?\>/)
			let beginning = (type ? type : "<p>")
			let end = (type ? type[0].replace("<", "</") : "</p>")
			let center = this.name!.split("\n").map(line => {
				if (line.match(/<.*?>/)) {
					line = line.replace(/<.*?>/, "")
				}
				line.replace(/\s*/, "&nbsp;")
				return line
			}).join("<br/>")

			return [beginning, center, end].join("")
		},
		// content() {
		// 	return this.name!.split('\n').map(line => {
		// 		if (line === "") return ""
		// 		let type = line.match(/\<.*?\>/)

		// 		if (!type) return `<p>${line}</p>`
		// 		if (type[0] === "<=>") return line
		// 		return line + type[0].replace("<", "</")
		// 	}).join("")
		// }
	},
})
</script>

<style>

</style>
