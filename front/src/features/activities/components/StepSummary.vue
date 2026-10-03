<script setup vapor lang="ts">
import { stepNumber, type ActivityStepData } from "@features/activities/model/step";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const { index, step } = defineProps<{
    index: number;
    step: ActivityStepData;
}>();
</script>
<template>
    <div class="text-4xl font-thin opacity-30 tabular-nums">{{ stepNumber(index) }}</div>
    <div>
        <b v-if="step.title">{{ step.title }}</b>
        <p class="text-xs"
           v-html="step.description"></p>
        <span class="badge badge-ghost">
            {{ t(`activities.steps.kind.${step.kind}`) }}
        </span>
        <span class="ms-1 badge"
              v-if="step.duration">
            {{ t('activities.minutes', { minutes: step.duration }) }}
        </span>
        <span class="ms-1 badge"
              v-if="step.actions.length">
            {{ t('activities.steps.fields.actions.count', { count: step.actions.length }) }}
        </span>
        <span class="ms-1 badge"
              v-if="step.materials.length">
            {{ t('activities.steps.fields.materials.count', { count: step.materials.length }) }}
        </span>
        <span class="ms-1 badge"
              v-if="step.resources.length">
            {{ t('activities.steps.fields.resources.count', { count: step.resources.length }) }}
        </span>
    </div>
</template>
