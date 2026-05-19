<script setup lang="ts">
import { type ActivityMaterialData } from "@features/activities/composables/data/materials";

const { material } = defineProps<{
    material: ActivityMaterialData;
}>();
</script>
<template>
    <div class="text-center p-1">
        <img class="size-16 rounded-box"
             src="https://placeholder.pagebee.io/api/plain/64/64" />
        <span class="text-xs">{{ material.name }}</span>
        <slot></slot>
    </div>
</template>