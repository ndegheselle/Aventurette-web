<script setup lang="ts">
import { stepNumber, type ActivityStepData } from "@features/activities/model/step";

const { index, step } = defineProps<{
    index: number;
    step: ActivityStepData;
}>();
</script>
<template>
    <div class="text-4xl font-thin opacity-30 tabular-nums">{{ stepNumber(index) }}</div>
    <div>
        <b v-if="step.title">{{ step.title }}</b>
        <span class="ms-2 text-xs opacity-60"
              v-if="step.duration">
            {{ $t('activities.minutes', { minutes: step.duration }) }}
        </span>
        <p class="text-xs"
           v-html="step.description"></p>
    </div>
</template>
