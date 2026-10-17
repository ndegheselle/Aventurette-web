<!-- The activity's attributes: the essentials, and the rest behind "more". -->
<script setup lang="ts">
import type { RangeLabel } from '@chapelure/ui/inputs/range';
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
    <ul class="list bg-base-200 rounded-box border border-base-content/5">
        <li v-if="activity.place.indoor || activity.place.outdoor" class="list-row flex justify-between">
            <div class="text-sm opacity-60 flex items-center gap-1">
                <MapPinIcon class="size-4" /> {{ $t('activities.families.place') }}
            </div>
            <div class="flex flex-wrap gap-1">
                <span v-if="activity.place.indoor" class="badge">{{ $t('activities.fields.indoor') }}</span>
                <span v-if="activity.place.outdoor" class="badge">{{ $t('activities.fields.outdoor')
                    }}</span>
            </div>
        </li>
        <li class="list-row flex justify-between">
            <div class="text-sm opacity-60 flex items-center gap-1">
                <CakeIcon class="size-4" /> {{ $t('activities.fields.age') }}
            </div>
            <div>{{ $t(ageLabel.key, ageLabel.params) }}</div>
        </li>
        <li class="list-row flex justify-between">
            <div class="text-sm opacity-60 flex items-center gap-1">
                <UsersIcon class="size-4" /> {{ $t('activities.fields.participants') }}
            </div>
            <div>{{ $t(participantsLabel.key, participantsLabel.params) }}</div>
        </li>
        <li class="list-row flex justify-between">
            <div class="text-sm opacity-60 flex items-center gap-1">
                <HourglassIcon class="size-4" /> {{ $t('activities.fields.preparationTime') }}
            </div>
            <div>{{ $t('activities.minutes', { minutes: timing.preparation }) }}</div>
        </li>
        <li class="list-row flex justify-between">
            <div class="text-sm opacity-60 flex items-center gap-1">
                <ClockIcon class="size-4" /> {{ $t('activities.fields.playTime') }}
            </div>
            <div>{{ $t('activities.minutes', { minutes: timing.play }) }}</div>
        </li>

        <template v-if="showMore">
            <li class="list-row flex justify-between">
                <div class="text-sm opacity-60 flex items-center gap-1">
                    <TimerIcon class="size-4" /> {{ $t('activities.fields.totalTime') }}
                </div>
                <div>{{ $t('activities.minutes', { minutes: timing.total }) }}</div>
            </li>
            <li v-if="activity.classification.format" class="list-row flex justify-between">
                <div class="text-sm opacity-60 flex items-center gap-1">
                    <ShapesIcon class="size-4" /> {{ $t('activities.fields.format') }}
                </div>
                <div>{{ $t(`activities.format.${activity.classification.format}`) }}</div>
            </li>
            <li v-if="activity.classification.practices.length" class="list-row flex justify-between">
                <div class="text-sm opacity-60 flex items-center gap-1">
                    <PaletteIcon class="size-4" /> {{ $t('activities.fields.practices') }}
                </div>
                <div class="flex flex-wrap justify-end gap-1">
                    <span v-for="practice in activity.classification.practices" :key="practice" class="badge">
                        {{ $t(`activities.practice.${practice}`) }}
                    </span>
                </div>
            </li>
            <li v-if="activity.classification.themes.length" class="list-row flex justify-between">
                <div class="text-sm opacity-60 flex items-center gap-1">
                    <TagIcon class="size-4" /> {{ $t('activities.tagType.THEME') }}
                </div>
                <div class="flex flex-wrap justify-end gap-1">
                    <span v-for="tag in activity.classification.themes" :key="tag.id" class="badge">{{ tag.name }}</span>
                </div>
            </li>
            <li v-if="activity.imaginary.rule" class="list-row flex justify-between">
                <div class="text-sm opacity-60 flex items-center gap-1">
                    <SparklesIcon class="size-4" /> {{ $t('activities.fields.imaginaryRule') }}
                </div>
                <div>{{ $t(`activities.imaginaryRule.${activity.imaginary.rule}`) }}</div>
            </li>
            <li v-if="activity.imaginary.universes.length" class="list-row flex justify-between">
                <div class="text-sm opacity-60 flex items-center gap-1">
                    <SparklesIcon class="size-4" /> {{ $t('activities.tagType.IMAGINARY') }}
                </div>
                <div class="flex flex-wrap justify-end gap-1">
                    <span v-for="tag in activity.imaginary.universes" :key="tag.id" class="badge">{{ tag.name }}</span>
                </div>
            </li>
            <li v-if="activity.audience.childrenPace" class="list-row flex justify-between">
                <div class="text-sm opacity-60 flex items-center gap-1">
                    <GaugeIcon class="size-4" /> {{ $t('activities.fields.childrenPace') }}
                </div>
                <div>{{ $t(`activities.childrenPace.${activity.audience.childrenPace}`) }}</div>
            </li>
            <li v-if="activity.supervision.hostEffort" class="list-row flex justify-between">
                <div class="text-sm opacity-60 flex items-center gap-1">
                    <HandIcon class="size-4" /> {{ $t('activities.fields.hostEffort') }}
                </div>
                <div>{{ $t(`activities.hostEffort.${activity.supervision.hostEffort}`) }}</div>
            </li>
            <li v-if="activity.supervision.hostsRequired" class="list-row flex justify-between">
                <div class="text-sm opacity-60 flex items-center gap-1">
                    <UserCheckIcon class="size-4" /> {{ $t('activities.fields.hosts') }}
                </div>
                <div>{{ activity.supervision.hostsRequired }}</div>
            </li>
            <li v-if="activity.supervision.crossSupervision" class="list-row flex justify-between">
                <div class="text-sm opacity-60 flex items-center gap-1">
                    <EyeIcon class="size-4" /> {{ $t('activities.fields.crossSupervision') }}
                </div>
                <div><CheckIcon class="size-4" /></div>
            </li>
            <li v-if="activity.place.locations.length" class="list-row flex justify-between">
                <div class="text-sm opacity-60 flex items-center gap-1">
                    <MapIcon class="size-4" /> {{ $t('activities.fields.locations') }}
                </div>
                <div class="flex flex-wrap justify-end gap-1">
                    <span v-for="location in activity.place.locations" :key="location" class="badge">
                        {{ $t(`activities.location.${location}`) }}
                    </span>
                </div>
            </li>
            <li v-if="activity.place.seasons.length" class="list-row flex justify-between">
                <div class="text-sm opacity-60 flex items-center gap-1">
                    <LeafIcon class="size-4" /> {{ $t('activities.fields.seasons') }}
                </div>
                <div class="flex flex-wrap justify-end gap-1">
                    <span v-for="season in activity.place.seasons" :key="season" class="badge">
                        {{ $t(`activities.season.${season}`) }}
                    </span>
                </div>
            </li>
            <li v-if="activity.pedagogy.goals.length" class="list-row flex justify-between">
                <div class="text-sm opacity-60 flex items-center gap-1">
                    <TargetIcon class="size-4" /> {{ $t('activities.tagType.GOAL') }}
                </div>
                <div class="flex flex-wrap justify-end gap-1">
                    <span v-for="tag in activity.pedagogy.goals" :key="tag.id" class="badge">{{ tag.name }}</span>
                </div>
            </li>
            <li v-if="activity.pedagogy.idealFor.length" class="list-row flex justify-between">
                <div class="text-sm opacity-60 flex items-center gap-1">
                    <StarIcon class="size-4" /> {{ $t('activities.tagType.IDEAL_FOR') }}
                </div>
                <div class="flex flex-wrap justify-end gap-1">
                    <span v-for="tag in activity.pedagogy.idealFor" :key="tag.id" class="badge">{{ tag.name }}</span>
                </div>
            </li>
        </template>

        <li class="flex justify-center p-1">
            <button type="button" class="btn btn-ghost btn-xs" :aria-expanded="showMore"
                    @click="showMore = !showMore">
                {{ showMore ? $t('activities.details.less') : $t('activities.details.more') }}
                <ChevronUpIcon v-if="showMore" class="size-4" />
                <ChevronDownIcon v-else class="size-4" />
            </button>
        </li>
    </ul>
</template>
