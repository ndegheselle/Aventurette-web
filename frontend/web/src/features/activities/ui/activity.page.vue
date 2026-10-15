<script setup lang="ts">
import List from '@chapelure/ui/data/List.vue';
import Container from '@chapelure/ui/layout/Container.vue';
import Panel from '@chapelure/ui/layout/Panel.vue';
import { useActivity } from '@features/activities/composables/useActivity';
import { stepNumber } from '@features/activities/models/step';
import { routesNames as activitiesRoutesNames } from '@features/activities/routes';
import { ArrowLeftIcon, CakeIcon, ClockIcon, HourglassIcon, ListOrderedIcon, MapPinIcon, PackageOpenIcon, ScrollTextIcon, ShieldAlertIcon, UsersIcon } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

const router = useRouter();
const { activity, timing, ageLabel, participantsLabel } = useActivity();

// Opened from a link straight to the page, there is no previous page: fall back to the library.
function back() {
    if (router.options.history.state.back) router.back();
    else router.push({ name: activitiesRoutesNames.library });
}
</script>

<template>
    <Container>
        <div class="sticky top-0 z-10 flex items-center gap-2 bg-base-100 p-2">
            <button type="button"
                    class="btn btn-ghost btn-circle"
                    :aria-label="$t('back')"
                    @click="back">
                <ArrowLeftIcon />
            </button>
            <h1 v-if="activity" class="text-xl truncate">{{ activity.name }}</h1>
        </div>

        <div v-if="!activity" class="flex justify-center p-8">
            <span class="loading loading-spinner"></span>
        </div>

        <div v-else class="flex flex-col gap-2 mx-2">
            <img src="https://placeholder.pagebee.io/api/plain/800/400" alt=""
                 class="w-full max-h-64 object-cover rounded-box" />

            <div class="flex flex-wrap gap-1">
                <span v-if="activity.classification.format" class="badge badge-primary">
                    {{ $t(`activities.format.${activity.classification.format}`) }}
                </span>
                <span v-for="theme in activity.classification.themes" :key="theme.id" class="badge">
                    {{ theme.name }}
                </span>
            </div>

            <Panel>
                <dl class="grid grid-cols-2 gap-2">
                    <div>
                        <dt class="text-sm opacity-60 flex items-center gap-1">
                            <CakeIcon class="size-4" /> {{ $t('activities.fields.age') }}
                        </dt>
                        <dd>{{ $t(ageLabel.key, ageLabel.params) }}</dd>
                    </div>
                    <div>
                        <dt class="text-sm opacity-60 flex items-center gap-1">
                            <UsersIcon class="size-4" /> {{ $t('activities.fields.participants') }}
                        </dt>
                        <dd>{{ $t(participantsLabel.key, participantsLabel.params) }}</dd>
                    </div>
                    <div>
                        <dt class="text-sm opacity-60 flex items-center gap-1">
                            <HourglassIcon class="size-4" /> {{ $t('activities.fields.preparationTime') }}
                        </dt>
                        <dd>{{ $t('activities.minutes', { minutes: timing.preparation }) }}</dd>
                    </div>
                    <div>
                        <dt class="text-sm opacity-60 flex items-center gap-1">
                            <ClockIcon class="size-4" /> {{ $t('activities.fields.playTime') }}
                        </dt>
                        <dd>{{ $t('activities.minutes', { minutes: timing.play }) }}</dd>
                    </div>
                    <div v-if="activity.place.indoor || activity.place.outdoor" class="col-span-2">
                        <dt class="text-sm opacity-60 flex items-center gap-1">
                            <MapPinIcon class="size-4" /> {{ $t('activities.families.place') }}
                        </dt>
                        <dd class="flex flex-wrap gap-1">
                            <span v-if="activity.place.indoor" class="badge">{{ $t('activities.fields.indoor') }}</span>
                            <span v-if="activity.place.outdoor" class="badge">{{ $t('activities.fields.outdoor') }}</span>
                        </dd>
                    </div>
                </dl>
            </Panel>

            <Panel>
                <h2 class="text-lg flex items-center gap-2">
                    <ScrollTextIcon class="opacity-50" /> {{ $t('activities.description') }}
                </h2>
                <div v-html="activity.description"></div>
            </Panel>

            <Panel v-if="activity.safety.instructions.length">
                <h2 class="text-lg flex items-center gap-2">
                    <ShieldAlertIcon class="opacity-50" /> {{ $t('activities.fields.safetyInstructions') }}
                </h2>
                <ul class="list-disc ps-5">
                    <li v-for="instruction in activity.safety.instructions" :key="instruction.id">
                        {{ instruction.name }}
                    </li>
                </ul>
            </Panel>

            <Panel>
                <h2 class="text-lg flex items-center gap-2">
                    <PackageOpenIcon class="opacity-50" /> {{ $t('activities.materials.title') }}
                </h2>
                <p v-if="!activity.materials.length" class="opacity-60">{{ $t('activities.materials.notNeeded') }}</p>
                <ul v-else class="flex flex-col gap-1">
                    <li v-for="material in activity.materials" :key="material.id" class="flex justify-between gap-2">
                        <span>{{ material.name }}</span>
                        <span v-if="material.quantity" class="opacity-60">{{ material.quantity }}</span>
                    </li>
                </ul>
            </Panel>

            <Panel v-if="activity.workshops.length">
                <h2 class="text-lg flex items-center gap-2">
                    <UsersIcon class="opacity-50" /> {{ $t('activities.workshops.title') }}
                </h2>
                <List :items="activity.workshops" v-slot="{ item }">
                    <div>
                        <b>{{ item.name }}</b>
                        <span v-if="item.theme" class="ms-2 text-sm opacity-60">{{ item.theme }}</span>
                        <div class="text-xs" v-html="item.challenges"></div>
                    </div>
                    <span v-if="item.adults_required" class="badge">
                        {{ $t('activities.workshops.adults', { count: item.adults_required }) }}
                    </span>
                </List>
            </Panel>

            <Panel>
                <h2 class="text-lg flex items-center gap-2">
                    <ListOrderedIcon class="opacity-50" /> {{ $t('activities.steps.title') }}
                </h2>
                <List :items="activity.steps" v-slot="{ item, index }">
                    <div class="text-4xl font-thin opacity-30 tabular-nums">{{ stepNumber(index) }}</div>
                    <div>
                        <b v-if="item.title">{{ item.title }}</b>
                        <span v-if="item.duration" class="ms-2 text-xs opacity-60">
                            {{ $t('activities.minutes', { minutes: item.duration }) }}
                        </span>
                        <div class="text-xs" v-html="item.description"></div>
                    </div>
                </List>
            </Panel>
        </div>
    </Container>
</template>
