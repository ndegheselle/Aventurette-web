<script setup lang="ts">
import { useAttributes } from '@features/activities/composables/useAttributes';
import { picksOf, type ActivityData } from '@features/activities/model/activity';
import { AttributeType } from '@features/activities/model/attribute';
import { computed } from 'vue';

/**
 * Every keyword an activity was tagged with, across the catalogue's vocabularies — what used to
 * be its benefits, now Domaine, Saison, Imaginaire and the six developmental groups alike.
 *
 * Flat on purpose: a badge reads as the word a user would search for, and which vocabulary it
 * came from is the filter's business rather than the summary's.
 */
const { activity } = defineProps<{ activity?: ActivityData }>();

const { attributes } = useAttributes();

const keywords = computed(() => attributes.value
    .filter(attribute => attribute.type === AttributeType.multi_choice)
    .flatMap(attribute => picksOf(activity, attribute)));
</script>

<template>
    <div class="flex flex-wrap gap-1">
        <span class="badge badge-soft" v-for="keyword in keywords" :key="keyword.id">{{ keyword.label }}</span>
    </div>
</template>
