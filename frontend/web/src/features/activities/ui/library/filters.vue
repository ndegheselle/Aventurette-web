<!-- The catalogue's filters: the quick ones always, every one once the sheet is expanded.
     Not wired to the feed yet: they show what will be filtered on. -->
<script setup lang="ts">
import {
    ActivityFormat,
    ActivityLocation,
    ActivityPractice,
    ActivitySeason,
    ChildrenPace
} from '@features/activities/models/activity';

defineProps<{
    expanded: boolean;
}>();

/** Each group of the full filters: its title's key, and its options' key prefix and values. */
const groups = [
    { title: 'activities.fields.format', prefix: 'activities.format', values: Object.values(ActivityFormat) },
    { title: 'activities.fields.practices', prefix: 'activities.practice', values: Object.values(ActivityPractice) },
    { title: 'activities.fields.childrenPace', prefix: 'activities.childrenPace', values: Object.values(ChildrenPace) },
    { title: 'activities.fields.locations', prefix: 'activities.location', values: Object.values(ActivityLocation) },
    { title: 'activities.fields.seasons', prefix: 'activities.season', values: Object.values(ActivitySeason) }
];

const quick = ['age', 'duration', 'location'] as const;
</script>

<template>
    <div class="flex flex-col gap-4">
        <div class="grid grid-cols-3 gap-2 opacity-50">
            <div v-for="filter in quick" :key="filter" class="flex flex-col mx-auto">
                <img class="mask mask-circle" src="https://placeholder.pagebee.io/api/plain/64/64" alt="" />
                <span class="text-sm text-center">{{ $t(`activities.filters.quick.${filter}`) }}</span>
            </div>
        </div>

        <template v-if="expanded">
            <fieldset v-for="group in groups" :key="group.title" class="fieldset">
                <legend class="fieldset-legend">{{ $t(group.title) }}</legend>
                <div class="flex flex-wrap gap-2">
                    <button v-for="value in group.values" :key="value"
                            type="button" class="btn btn-sm btn-soft" disabled>
                        {{ $t(`${group.prefix}.${value}`) }}
                    </button>
                </div>
            </fieldset>
        </template>
    </div>
</template>
