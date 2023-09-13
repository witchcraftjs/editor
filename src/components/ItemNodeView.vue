<template>
<node-view-wrapper class="vue-component">
	<span class="label">Vue Component</span>

	<div class="content">
		Hello
	</div>

	<node-view-content class="content"/>
</node-view-wrapper>
</template>

<script setup lang="ts">
import { NodeViewContent, nodeViewProps, NodeViewWrapper } from "@tiptap/vue-3"


const props = defineProps(nodeViewProps)
</script>
