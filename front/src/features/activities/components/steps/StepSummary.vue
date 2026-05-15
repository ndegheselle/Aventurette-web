<script setup lang="ts">
import { type ActivityStepData } from "@features/activities/composables/data/activities";

const { index, step } = defineProps<{
    index: number;
    step: ActivityStepData;
}>();
</script>
<template>
    <div class="text-4xl font-thin opacity-30 tabular-nums">{{ String(index + 1).padStart(2, '0') }}</div>
    <div>
        <p class="text-xs"
           v-html="step.description"></p>
    </div>
</template>