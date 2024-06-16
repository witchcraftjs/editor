<template>
	<div
		tabindex="0"
		:style="`top:${loc.y}px; left:${loc.x}px`"
		contenteditable="false"
		class="contextmenu"
		@blur="blur"
	>
		<div class="button" @click="command('heading')">Heading</div>
		<div class="button" @click="command('paragraph')">Paragraph</div>
	</div>
</template>

<script lang="ts">
import type { Transaction } from "prosemirror-state"
import { defineComponent, onMounted } from "vue"

import { debug_node } from "./dev_utils"
import { schema } from "./schema"


export default defineComponent({
	name: "contextmenu",
	data() {
		return {
			loc: { x: 0, y: 0 },
			scrollY: 0,
			scrollX: 0,
		}
	},
	methods: {
		blur() {
			this.pm.destroy()
		},
		command(type: string) {
			let tr = this.pm.view.state.tr as Transaction
			let pos = this.pm.get_pos()
			let $node = this.pm.view.state.doc.resolve(pos + 2)

			switch (type) {
				case "heading": {
					tr.setNodeMarkup($node.start() - 1, schema.nodes.heading, { ...$node.node().attrs })
				} break
				case "paragraph": {
					tr.setNodeMarkup($node.start() - 1, schema.nodes.paragraph, { ...$node.node().attrs })
				}
			}
			this.pm.view.dispatch(tr)
		},
		calculate() {
			let item = this.pm.view.nodeDOM(this.pm.get_pos()) as HTMLDivElement
			let item_rect = item.querySelector(".handles")!.getBoundingClientRect()
			let inner_width = document.documentElement.clientWidth

			let menu_rect = this.$el.getBoundingClientRect()
			let padding = 10
			this.loc.x = item_rect.left + item_rect.width / 2 - (menu_rect.width / 2) + padding < scrollX
				? scrollX + padding
				: item_rect.left - (menu_rect.width / 2) + padding

			this.loc.y = item_rect.bottom
			// this.loc.y = item_rect.bottom + menu_rect.height + padding > scrollY + inner_height
			// 	? scrollY + inner_height - (padding + menu_rect.height)
			// 	: item_rect.bottom
		},
	},
	mounted() {
		this.calculate()

		this.$el.focus()
		window.addEventListener("scroll", this.calculate)
		window.addEventListener("resize", this.calculate)
	},
	beforeUnmount() {
		console.log("destroyed")

		window.removeEventListener("scroll", this.calculate)
		window.addEventListener("resize", this.calculate)
	},
})
</script>

<style lang="scss">
</style>
