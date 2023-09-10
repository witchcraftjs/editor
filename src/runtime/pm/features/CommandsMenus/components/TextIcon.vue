<template>
<span v-bind="$attrs">
	{{ text }}
</span>
</template>

<script setup lang="ts">
import { useAttrs } from "vue"

/* const props =  */defineProps<{
	text: string
}>()
const $attrs = useAttrs()
</script>
