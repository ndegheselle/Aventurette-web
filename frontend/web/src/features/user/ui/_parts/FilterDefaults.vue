<!-- The filter defaults' fields, for the onboarding and the profile: the ages, the duration and the places. -->
<script setup lang="ts">
import RangeInput from '@chapelure/ui/inputs/RangeInput.vue';
import { rangeLabel } from '@chapelure/ui/inputs/range';
import { toggled } from '@chapelure/ui/inputs/selection';
import { DEFAULT_AGE_BOUNDS, DEFAULT_DURATION_BOUNDS, Location, type FilterDefaultsData } from '@features/user/models/user';

const defaults = defineModel<FilterDefaultsData>({ required: true });

const locations = Object.values(Location);
</script>

<template>
    <div class="flex flex-col gap-4">
        <fieldset class="fieldset">
            <legend class="fieldset-legend w-full">
                {{ $t('user.filterDefaults.age') }}
                <span class="ms-auto font-normal opacity-70">
                    {{ $t(rangeLabel(defaults.ageMin, defaults.ageMax).key, rangeLabel(defaults.ageMin, defaults.ageMax).params) }}
                </span>
            </legend>
            <RangeInput class="text-primary" v-bind="DEFAULT_AGE_BOUNDS"
                        v-model:min="defaults.ageMin" v-model:max="defaults.ageMax" />
        </fieldset>

        <fieldset class="fieldset">
            <legend class="fieldset-legend w-full">
                {{ $t('user.filterDefaults.duration') }}
                <span class="ms-auto font-normal opacity-70">
                    {{ $t(rangeLabel(defaults.durationMin, defaults.durationMax).key, rangeLabel(defaults.durationMin, defaults.durationMax).params) }}
                </span>
            </legend>
            <RangeInput class="text-primary" v-bind="DEFAULT_DURATION_BOUNDS"
                        v-model:min="defaults.durationMin" v-model:max="defaults.durationMax" />
        </fieldset>

        <fieldset class="fieldset">
            <legend class="fieldset-legend">{{ $t('user.filterDefaults.locations') }}</legend>
            <div class="flex flex-wrap gap-2">
                <button v-for="location in locations" :key="location"
                        type="button" class="btn btn-sm"
                        :class="defaults.locations.includes(location) ? 'btn-primary' : 'btn-soft'"
                        :aria-pressed="defaults.locations.includes(location)"
                        @click="() => defaults.locations = toggled(defaults.locations, location)">
                    {{ $t(`activities.location.${location}`) }}
                </button>
            </div>
        </fieldset>
    </div>
</template>
