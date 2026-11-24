<script setup lang="ts">
import { stepNumber, type ActivityStepData } from '@features/activities/models/step';

const { index, step } = defineProps<{
    index: number;
    step: ActivityStepData;
}>();
</script>

<template>
    <div class="text-4xl font-thin text-muted-foreground/50 tabular-nums">{{ stepNumber(index) }}</div>
    <div class="flex-1">
        <b v-if="step.title">{{ step.title }}</b>
        <span v-if="step.duration" class="ms-2 text-xs text-muted-foreground">
            {{ $t('activities.minutes', { minutes: step.duration }) }}
        </span>
        <p class="text-xs" v-html="step.description"></p>
    </div>
</template>
