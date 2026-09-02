<!--
  Progress header for the activity creation flow.
  Was copy-pasted into all three edit pages, each with its own hand-maintained `step-primary`s.
-->
<script setup lang="ts">
import { FileTextIcon, LibraryIcon, ListTreeIcon } from 'lucide-vue-next';
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
    <ul class="steps">
        <li class="step"
            :class="{ 'step-primary': isReached('description') }">
            <span class="flex gap-2 items-center">
                <FileTextIcon /> {{ $t('activities.edit.description') }}
            </span>
        </li>
        <li class="step"
            :class="{ 'step-primary': isReached('steps') }">
            <span class="flex gap-2 items-center">
                <ListTreeIcon /> {{ $t('activities.edit.steps') }}
            </span>
        </li>
        <li class="step"
            :class="{ 'step-primary': isReached('properties') }">
            <span class="flex gap-2 items-center">
                <LibraryIcon /> {{ $t('activities.edit.properties') }}
            </span>
        </li>
    </ul>
</template>
