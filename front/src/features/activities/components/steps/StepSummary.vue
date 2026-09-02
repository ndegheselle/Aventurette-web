<script setup lang="ts">
import { type ActivityStepData } from "@features/activities/model/activity";

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
        <span class="badge"
              v-if="step.materials.length">
            {{ step.materials.length + ' ' + $t('activities.steps.fields.materials.title')}}
        </span>
        <span class="ms-1 badge"
              v-if="step.resources.length">
            {{ step.resources.length + ' ' + $t('activities.steps.fields.resources.title') }}
        </span>
    </div>
</template>
