<script setup lang="ts">
import { twMerge } from "tailwind-merge"
import { computed } from "vue"

import type { FileViewProps } from "../pm/features/File/types.js"
import { testAssetsMap } from "../testDocuments.js"

const { id, src, width, height } = defineProps<FileViewProps>()

const asset = computed(() => id ? testAssetsMap[id] : undefined)
const isImage = computed(() => asset.value?.type === "image")
const imageData = computed(() => isImage.value ? asset.value!.data : undefined)
// NOTE: fallback to src for testing image rendering without assets map (disable fileViewInjectionKey in EditorDemoApp.vue)
const fallbackImage = computed(() => !isImage.value && src ? src : undefined)
const textContent = computed(() => asset.value?.type === "text" ? asset.value.data : "[Unknown file]")
</script>

<template>
<img
	v-if="isImage"
	:src="imageData"
	draggable="false"
	class="w-full h-full object-contain"
>
<!-- NOTE: keep this img in sync with the default rendering in FileNodeView.vue (max-w-full h-auto, style bindings) -->
<img
	v-else-if="fallbackImage"
	:src="fallbackImage"
	draggable="false"
	:class="twMerge(
		width === undefined ? `max-w-full h-auto` : `h-auto`
	)"
	:style="{
		width: width !== undefined ? `${width}px` : undefined,
		height: height !== undefined ? `${height}px` : undefined
	}"
>
<pre
	v-else
	class="whitespace-pre-wrap text-sm p-2 bg-gray-100 rounded"
>{{ textContent }}</pre>
</template>
