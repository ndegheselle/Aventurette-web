<script setup lang="ts">
const props = defineProps<{ title?: string }>();
</script>
<!--
  Group settings or other element with a title and a visible background
-->
<template>
    <div class="flex flex-col rounded-box bg-base-200 p-3">
        <div v-if="title || $slots.action" class="flex items-center justify-between">
            <h1 v-if="title" class="text-2xl">{{ title }}</h1>
            <div v-if="$slots.action" class="ml-auto">
                <slot name="action"></slot>
            </div>
        </div>
        <slot></slot>
    </div>
</template>