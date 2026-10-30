<!-- The catalogue's filter fields, bound to a draft: the one quick filter given as `only`, or every filter. -->
<script setup lang="ts">
import RangeInput from '@chapelure/ui/inputs/RangeInput.vue';
import { toggled } from '@chapelure/ui/inputs/selection';
import {
    CHOICE_GROUPS,
    isChosen,
    isQuickFilterSet,
    LOCATIONS,
    quickFilterLabel,
    withChoiceToggled,
    type CatalogueFilters,
    type QuickFilter
} from '@features/activities/models/catalogueFilters';
import { DEFAULT_AGE_BOUNDS, DEFAULT_DURATION_BOUNDS } from '@features/user/models/user';

const { only = null } = defineProps<{
    only?: QuickFilter | null;
}>();

const filters = defineModel<CatalogueFilters>({ required: true });

const shows = (quick: QuickFilter) => only === null || only === quick;
</script>

<template>
    <div class="flex flex-col gap-4">
        <fieldset v-if="shows('age')" class="fieldset">
            <legend class="fieldset-legend w-full">
                <template v-if="only === null">{{ $t('activities.filters.quick.age') }}</template>
                <span class="ms-auto font-normal opacity-70">
                    <template v-if="isQuickFilterSet(filters, 'age')">
                        {{ $t(quickFilterLabel(filters, 'age').key, quickFilterLabel(filters, 'age').params) }}
                    </template>
                    <template v-else>{{ $t('activities.filters.any') }}</template>
                </span>
            </legend>
            <RangeInput class="text-primary" v-bind="DEFAULT_AGE_BOUNDS"
                        v-model:min="filters.ageMin" v-model:max="filters.ageMax" />
        </fieldset>

        <fieldset v-if="shows('duration')" class="fieldset">
            <legend class="fieldset-legend w-full">
                <template v-if="only === null">{{ $t('activities.filters.quick.duration') }}</template>
                <span class="ms-auto font-normal opacity-70">
                    <template v-if="isQuickFilterSet(filters, 'duration')">
                        {{ $t(quickFilterLabel(filters, 'duration').key, quickFilterLabel(filters, 'duration').params) }}
                    </template>
                    <template v-else>{{ $t('activities.filters.any') }}</template>
                </span>
            </legend>
            <RangeInput class="text-primary" v-bind="DEFAULT_DURATION_BOUNDS"
                        v-model:min="filters.durationMin" v-model:max="filters.durationMax" />
        </fieldset>

        <fieldset v-if="shows('location')" class="fieldset">
            <legend v-if="only === null" class="fieldset-legend">{{ $t('activities.filters.quick.location') }}</legend>
            <div class="flex flex-wrap gap-2">
                <button v-for="location in LOCATIONS" :key="location"
                        type="button" class="btn btn-sm"
                        :class="filters.locations.includes(location) ? 'btn-primary' : 'btn-soft'"
                        :aria-pressed="filters.locations.includes(location)"
                        @click="() => filters.locations = toggled(filters.locations, location)">
                    {{ $t(`activities.location.${location}`) }}
                </button>
            </div>
        </fieldset>

        <template v-if="only === null">
            <fieldset v-for="group in CHOICE_GROUPS" :key="group.field" class="fieldset">
                <legend class="fieldset-legend">{{ $t(group.title) }}</legend>
                <div class="flex flex-wrap gap-2">
                    <button v-for="value in group.values" :key="value"
                            type="button" class="btn btn-sm"
                            :class="isChosen(filters, group.field, value) ? 'btn-primary' : 'btn-soft'"
                            :aria-pressed="isChosen(filters, group.field, value)"
                            @click="() => filters = withChoiceToggled(filters, group.field, value)">
                        {{ $t(`${group.prefix}.${value}`) }}
                    </button>
                </div>
            </fieldset>
        </template>
    </div>
</template>
