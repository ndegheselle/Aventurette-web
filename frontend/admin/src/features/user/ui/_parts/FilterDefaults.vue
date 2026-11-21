<!-- The filter defaults' fields, for the onboarding and the profile: the ages, the number of children and the places. -->
<script setup lang="ts">
import RangeInput from '@chapelure/ui/inputs/RangeInput.vue';
import { rangeLabel } from '@chapelure/ui/inputs/range';
import { toggled } from '@chapelure/ui/inputs/selection';
import { Button } from '@chapelure/ui/shadcn/button';
import { Label } from '@chapelure/ui/shadcn/label';
import { DEFAULT_AGE_BOUNDS, DEFAULT_PARTICIPANTS_BOUNDS, Location, type FilterDefaultsData } from '@features/user/models/user';

const defaults = defineModel<FilterDefaultsData>({ required: true });

const locations = Object.values(Location);
</script>

<template>
    <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-3">
            <div class="flex items-center gap-2">
                <Label>{{ $t('user.filterDefaults.age') }}</Label>
                <span class="ms-auto text-sm text-muted-foreground">
                    {{ $t(rangeLabel(defaults.ageMin, defaults.ageMax).key, rangeLabel(defaults.ageMin, defaults.ageMax).params) }}
                </span>
            </div>
            <RangeInput v-bind="DEFAULT_AGE_BOUNDS"
                        v-model:min="defaults.ageMin" v-model:max="defaults.ageMax" />
        </div>

        <div class="flex flex-col gap-3">
            <div class="flex items-center gap-2">
                <Label>{{ $t('user.filterDefaults.participants') }}</Label>
                <span class="ms-auto text-sm text-muted-foreground">
                    {{ $t(rangeLabel(defaults.participantsMin, defaults.participantsMax).key, rangeLabel(defaults.participantsMin, defaults.participantsMax).params) }}
                </span>
            </div>
            <RangeInput v-bind="DEFAULT_PARTICIPANTS_BOUNDS"
                        v-model:min="defaults.participantsMin" v-model:max="defaults.participantsMax" />
        </div>

        <div class="flex flex-col gap-3">
            <Label>{{ $t('user.filterDefaults.locations') }}</Label>
            <div class="flex flex-wrap gap-2">
                <Button v-for="location in locations" :key="location"
                        type="button" size="sm"
                        :variant="defaults.locations.includes(location) ? 'default' : 'secondary'"
                        :aria-pressed="defaults.locations.includes(location)"
                        @click="() => defaults.locations = toggled(defaults.locations, location)">
                    {{ $t(`activities.location.${location}`) }}
                </Button>
            </div>
        </div>
    </div>
</template>
