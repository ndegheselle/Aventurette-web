<!-- The activity's attributes: the essentials, and the rest behind "more". -->
<script setup lang="ts">
import type { RangeLabel } from '@chapelure/ui/inputs/range';
import { Badge } from '@chapelure/ui/shadcn/badge';
import { Button } from '@chapelure/ui/shadcn/button';
import type { ActivityData, ActivityTiming } from '@features/activities/models/activity';
import { CakeIcon, CheckIcon, ChevronDownIcon, ChevronUpIcon, ClockIcon, EyeIcon, GaugeIcon, HandIcon, HourglassIcon, LeafIcon, MapIcon, MapPinIcon, PaletteIcon, ShapesIcon, SparklesIcon, StarIcon, TagIcon, TargetIcon, TimerIcon, UserCheckIcon, UsersIcon } from 'lucide-vue-next';
import { ref } from 'vue';

defineProps<{
    activity: ActivityData;
    timing: ActivityTiming;
    ageLabel: RangeLabel;
    participantsLabel: RangeLabel;
}>();

const showMore = ref(false);
</script>

<template>
    <ul class="flex flex-col divide-y rounded-xl border bg-card text-card-foreground">
        <li v-if="activity.place.indoor || activity.place.outdoor" class="flex items-center justify-between gap-4 p-4">
            <div class="text-sm text-muted-foreground flex items-center gap-1">
                <MapPinIcon class="size-4" /> {{ $t('activities.families.place') }}
            </div>
            <div class="flex flex-wrap gap-1">
                <Badge v-if="activity.place.indoor" variant="secondary">{{ $t('activities.fields.indoor') }}</Badge>
                <Badge v-if="activity.place.outdoor" variant="secondary">{{ $t('activities.fields.outdoor') }}</Badge>
            </div>
        </li>
        <li class="flex items-center justify-between gap-4 p-4">
            <div class="text-sm text-muted-foreground flex items-center gap-1">
                <CakeIcon class="size-4" /> {{ $t('activities.fields.age') }}
            </div>
            <div>{{ $t(ageLabel.key, ageLabel.params) }}</div>
        </li>
        <li class="flex items-center justify-between gap-4 p-4">
            <div class="text-sm text-muted-foreground flex items-center gap-1">
                <UsersIcon class="size-4" /> {{ $t('activities.fields.participants') }}
            </div>
            <div>{{ $t(participantsLabel.key, participantsLabel.params) }}</div>
        </li>
        <li class="flex items-center justify-between gap-4 p-4">
            <div class="text-sm text-muted-foreground flex items-center gap-1">
                <HourglassIcon class="size-4" /> {{ $t('activities.fields.preparationTime') }}
            </div>
            <div>{{ $t('activities.minutes', { minutes: timing.preparation }) }}</div>
        </li>
        <li class="flex items-center justify-between gap-4 p-4">
            <div class="text-sm text-muted-foreground flex items-center gap-1">
                <ClockIcon class="size-4" /> {{ $t('activities.fields.playTime') }}
            </div>
            <div>{{ $t('activities.minutes', { minutes: timing.play }) }}</div>
        </li>

        <template v-if="showMore">
            <li class="flex items-center justify-between gap-4 p-4">
                <div class="text-sm text-muted-foreground flex items-center gap-1">
                    <TimerIcon class="size-4" /> {{ $t('activities.fields.totalTime') }}
                </div>
                <div>{{ $t('activities.minutes', { minutes: timing.total }) }}</div>
            </li>
            <li v-if="activity.classification.format" class="flex items-center justify-between gap-4 p-4">
                <div class="text-sm text-muted-foreground flex items-center gap-1">
                    <ShapesIcon class="size-4" /> {{ $t('activities.fields.format') }}
                </div>
                <div>{{ $t(`activities.format.${activity.classification.format}`) }}</div>
            </li>
            <li v-if="activity.classification.practices.length" class="flex items-center justify-between gap-4 p-4">
                <div class="text-sm text-muted-foreground flex items-center gap-1">
                    <PaletteIcon class="size-4" /> {{ $t('activities.fields.practices') }}
                </div>
                <div class="flex flex-wrap justify-end gap-1">
                    <Badge v-for="practice in activity.classification.practices" :key="practice" variant="secondary">
                        {{ $t(`activities.practice.${practice}`) }}
                    </Badge>
                </div>
            </li>
            <li v-if="activity.classification.themes.length" class="flex items-center justify-between gap-4 p-4">
                <div class="text-sm text-muted-foreground flex items-center gap-1">
                    <TagIcon class="size-4" /> {{ $t('activities.tagType.THEME') }}
                </div>
                <div class="flex flex-wrap justify-end gap-1">
                    <Badge v-for="tag in activity.classification.themes" :key="tag.id" variant="secondary">{{ tag.name }}</Badge>
                </div>
            </li>
            <li v-if="activity.imaginary.rule" class="flex items-center justify-between gap-4 p-4">
                <div class="text-sm text-muted-foreground flex items-center gap-1">
                    <SparklesIcon class="size-4" /> {{ $t('activities.fields.imaginaryRule') }}
                </div>
                <div>{{ $t(`activities.imaginaryRule.${activity.imaginary.rule}`) }}</div>
            </li>
            <li v-if="activity.imaginary.universes.length" class="flex items-center justify-between gap-4 p-4">
                <div class="text-sm text-muted-foreground flex items-center gap-1">
                    <SparklesIcon class="size-4" /> {{ $t('activities.tagType.IMAGINARY') }}
                </div>
                <div class="flex flex-wrap justify-end gap-1">
                    <Badge v-for="tag in activity.imaginary.universes" :key="tag.id" variant="secondary">{{ tag.name }}</Badge>
                </div>
            </li>
            <li v-if="activity.audience.childrenPace" class="flex items-center justify-between gap-4 p-4">
                <div class="text-sm text-muted-foreground flex items-center gap-1">
                    <GaugeIcon class="size-4" /> {{ $t('activities.fields.childrenPace') }}
                </div>
                <div>{{ $t(`activities.childrenPace.${activity.audience.childrenPace}`) }}</div>
            </li>
            <li v-if="activity.supervision.hostEffort" class="flex items-center justify-between gap-4 p-4">
                <div class="text-sm text-muted-foreground flex items-center gap-1">
                    <HandIcon class="size-4" /> {{ $t('activities.fields.hostEffort') }}
                </div>
                <div>{{ $t(`activities.hostEffort.${activity.supervision.hostEffort}`) }}</div>
            </li>
            <li v-if="activity.supervision.hostsRequired" class="flex items-center justify-between gap-4 p-4">
                <div class="text-sm text-muted-foreground flex items-center gap-1">
                    <UserCheckIcon class="size-4" /> {{ $t('activities.fields.hosts') }}
                </div>
                <div>{{ activity.supervision.hostsRequired }}</div>
            </li>
            <li v-if="activity.supervision.crossSupervision" class="flex items-center justify-between gap-4 p-4">
                <div class="text-sm text-muted-foreground flex items-center gap-1">
                    <EyeIcon class="size-4" /> {{ $t('activities.fields.crossSupervision') }}
                </div>
                <div><CheckIcon class="size-4" /></div>
            </li>
            <li v-if="activity.place.locations.length" class="flex items-center justify-between gap-4 p-4">
                <div class="text-sm text-muted-foreground flex items-center gap-1">
                    <MapIcon class="size-4" /> {{ $t('activities.fields.locations') }}
                </div>
                <div class="flex flex-wrap justify-end gap-1">
                    <Badge v-for="location in activity.place.locations" :key="location" variant="secondary">
                        {{ $t(`activities.location.${location}`) }}
                    </Badge>
                </div>
            </li>
            <li v-if="activity.place.seasons.length" class="flex items-center justify-between gap-4 p-4">
                <div class="text-sm text-muted-foreground flex items-center gap-1">
                    <LeafIcon class="size-4" /> {{ $t('activities.fields.seasons') }}
                </div>
                <div class="flex flex-wrap justify-end gap-1">
                    <Badge v-for="season in activity.place.seasons" :key="season" variant="secondary">
                        {{ $t(`activities.season.${season}`) }}
                    </Badge>
                </div>
            </li>
            <li v-if="activity.pedagogy.goals.length" class="flex items-center justify-between gap-4 p-4">
                <div class="text-sm text-muted-foreground flex items-center gap-1">
                    <TargetIcon class="size-4" /> {{ $t('activities.tagType.GOAL') }}
                </div>
                <div class="flex flex-wrap justify-end gap-1">
                    <Badge v-for="tag in activity.pedagogy.goals" :key="tag.id" variant="secondary">{{ tag.name }}</Badge>
                </div>
            </li>
            <li v-if="activity.pedagogy.idealFor.length" class="flex items-center justify-between gap-4 p-4">
                <div class="text-sm text-muted-foreground flex items-center gap-1">
                    <StarIcon class="size-4" /> {{ $t('activities.tagType.IDEAL_FOR') }}
                </div>
                <div class="flex flex-wrap justify-end gap-1">
                    <Badge v-for="tag in activity.pedagogy.idealFor" :key="tag.id" variant="secondary">{{ tag.name }}</Badge>
                </div>
            </li>
        </template>

        <li class="flex justify-center p-1">
            <Button type="button" variant="ghost" size="xs" :aria-expanded="showMore"
                    @click="showMore = !showMore">
                {{ showMore ? $t('activities.details.less') : $t('activities.details.more') }}
                <ChevronUpIcon v-if="showMore" class="size-4" />
                <ChevronDownIcon v-else class="size-4" />
            </Button>
        </li>
    </ul>
</template>
