<!-- The catalogue's filter fields, bound to a draft: the one quick filter given as `only`, or every filter. -->
<script setup lang="ts">
import RangeInput from '@chapelure/ui/inputs/RangeInput.vue';
import { toggled } from '@chapelure/ui/inputs/selection';
import { Button } from '@chapelure/ui/shadcn/button';
import { Label } from '@chapelure/ui/shadcn/label';
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
import { DEFAULT_AGE_BOUNDS, DEFAULT_PARTICIPANTS_BOUNDS } from '@features/user/models/user';

const { only = null } = defineProps<{
    only?: QuickFilter | null;
}>();

const filters = defineModel<CatalogueFilters>({ required: true });

const shows = (quick: QuickFilter) => only === null || only === quick;
</script>

<template>
    <div class="flex flex-col gap-4">
        <div v-if="shows('age')" class="flex flex-col gap-2">
            <Label>
                <template v-if="only === null">{{ $t('activities.filters.quick.age') }}</template>
                <span class="ms-auto font-normal text-muted-foreground">
                    <template v-if="isQuickFilterSet(filters, 'age')">
                        {{ $t(quickFilterLabel(filters, 'age').key, quickFilterLabel(filters, 'age').params) }}
                    </template>
                    <template v-else>{{ $t('activities.filters.any') }}</template>
                </span>
            </Label>
            <RangeInput v-bind="DEFAULT_AGE_BOUNDS"
                        v-model:min="filters.ageMin" v-model:max="filters.ageMax" />
        </div>

        <div v-if="shows('participants')" class="flex flex-col gap-2">
            <Label>
                <template v-if="only === null">{{ $t('activities.filters.quick.participants') }}</template>
                <span class="ms-auto font-normal text-muted-foreground">
                    <template v-if="isQuickFilterSet(filters, 'participants')">
                        {{ $t(quickFilterLabel(filters, 'participants').key, quickFilterLabel(filters, 'participants').params) }}
                    </template>
                    <template v-else>{{ $t('activities.filters.any') }}</template>
                </span>
            </Label>
            <RangeInput v-bind="DEFAULT_PARTICIPANTS_BOUNDS"
                        v-model:min="filters.participantsMin" v-model:max="filters.participantsMax" />
        </div>

        <div v-if="shows('location')" class="flex flex-col gap-2">
            <Label v-if="only === null">{{ $t('activities.filters.quick.location') }}</Label>
            <div class="flex flex-wrap gap-2">
                <Button v-for="location in LOCATIONS" :key="location"
                        type="button" size="sm"
                        :variant="filters.locations.includes(location) ? 'default' : 'secondary'"
                        :aria-pressed="filters.locations.includes(location)"
                        @click="() => filters.locations = toggled(filters.locations, location)">
                    {{ $t(`activities.location.${location}`) }}
                </Button>
            </div>
        </div>

        <template v-if="only === null">
            <div v-for="group in CHOICE_GROUPS" :key="group.field" class="flex flex-col gap-2">
                <Label>{{ $t(group.title) }}</Label>
                <div class="flex flex-wrap gap-2">
                    <Button v-for="value in group.values" :key="value"
                            type="button" size="sm"
                            :variant="isChosen(filters, group.field, value) ? 'default' : 'secondary'"
                            :aria-pressed="isChosen(filters, group.field, value)"
                            @click="() => filters = withChoiceToggled(filters, group.field, value)">
                        {{ $t(`${group.prefix}.${value}`) }}
                    </Button>
                </div>
            </div>
        </template>
    </div>
</template>
