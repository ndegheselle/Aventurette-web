<!--
  Progress header for the activity creation flow.
  Was copy-pasted into all three edit pages, each with its own hand-maintained `step-primary`s.
-->
<script setup lang="ts">
import { FileTextIcon, LibraryIcon, ListTreeIcon } from 'lucide-vue-next';
import Step from '@chapelure/ui/layout/Step.vue';
import Steps from '@chapelure/ui/layout/Steps.vue';
import { computed } from 'vue';

const ORDER = ['description', 'steps', 'properties'] as const;
type EditStep = typeof ORDER[number];

const { current } = defineProps<{
    current: EditStep;
}>();

const reachedUpTo = computed(() => ORDER.indexOf(current));
const isReached = (step: EditStep) => ORDER.indexOf(step) <= reachedUpTo.value;
</script>

<template>
    <Steps>
        <Step :done="isReached('description')">
            <FileTextIcon /> {{ $t('activities.edit.description') }}
        </Step>
        <Step :done="isReached('steps')">
            <ListTreeIcon /> {{ $t('activities.edit.steps') }}
        </Step>
        <Step :done="isReached('properties')">
            <LibraryIcon /> {{ $t('activities.edit.properties') }}
        </Step>
    </Steps>
</template>
