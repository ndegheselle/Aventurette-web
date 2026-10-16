<script setup lang="ts">
import List from '@chapelure/ui/data/List.vue';
import Container from '@chapelure/ui/layout/Container.vue';
import Panel from '@chapelure/ui/layout/Panel.vue';
import { useActivity } from '@features/activities/composables/useActivity';
import { stepNumber } from '@features/activities/models/step';
import { routesNames as activitiesRoutesNames } from '@features/activities/routes';
import { ArrowLeftIcon, CakeIcon, ClockIcon, HourglassIcon, HeartIcon, MapPinIcon, PackageOpenIcon, ShieldAlertIcon, UsersIcon, PresentationIcon, PlayIcon } from 'lucide-vue-next';
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

        <button type="button" class="btn btn-soft btn-square btn-lg fixed m-4" :aria-label="$t('back')" @click="back">
            <ArrowLeftIcon />
        </button>

        <div v-if="!activity" class="flex justify-center p-8">
            <span class="loading loading-spinner"></span>
        </div>

        <div v-else>
            <div>
                <img src="https://placeholder.pagebee.io/api/plain/800/800" alt="" class="w-full h-90 object-cover" />
                <div class="text-center my-8">
                    <h1 class="text-2xl md:text-3xl lg:text-4xl font-bold">{{ activity.name }}</h1>
                    <span class="text-sm" v-html="activity.description"></span>
                </div>
            </div>

            <div class="mx-2 flex flex-col gap-2">
                <ul class="list bg-base-100 rounded-box border border-base-content/5">
                    <li v-if="activity.place.indoor || activity.place.outdoor" class="list-row flex justify-between">
                        <dt class="text-sm opacity-60 flex items-center gap-1">
                            <MapPinIcon class="size-4" /> {{ $t('activities.families.place') }}
                        </dt>
                        <dd class="flex flex-wrap gap-1">
                            <span v-if="activity.place.indoor" class="badge">{{ $t('activities.fields.indoor') }}</span>
                            <span v-if="activity.place.outdoor" class="badge">{{ $t('activities.fields.outdoor')
                                }}</span>
                        </dd>
                    </li>
                    <li class="list-row flex justify-between">
                        <dt class="text-sm opacity-60 flex items-center gap-1">
                            <CakeIcon class="size-4" /> {{ $t('activities.fields.age') }}
                        </dt>
                        <dd>{{ $t(ageLabel.key, ageLabel.params) }}</dd>
                    </li>
                    <li class="list-row flex justify-between">
                        <dt class="text-sm opacity-60 flex items-center gap-1">
                            <UsersIcon class="size-4" /> {{ $t('activities.fields.participants') }}
                        </dt>
                        <dd>{{ $t(participantsLabel.key, participantsLabel.params) }}</dd>
                    </li>
                    <li class="list-row flex justify-between">
                        <dt class="text-sm opacity-60 flex items-center gap-1">
                            <HourglassIcon class="size-4" /> {{ $t('activities.fields.preparationTime') }}
                        </dt>
                        <dd>{{ $t('activities.minutes', { minutes: timing.preparation }) }}</dd>
                    </li>
                    <li class="list-row flex justify-between">
                        <dt class="text-sm opacity-60 flex items-center gap-1">
                            <ClockIcon class="size-4" /> {{ $t('activities.fields.playTime') }}
                        </dt>
                        <dd>{{ $t('activities.minutes', { minutes: timing.play }) }}</dd>
                    </li>
                </ul>

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

                <Panel v-if="activity.materials.length">
                    <h2 class="text-lg flex items-center gap-2">
                        <PackageOpenIcon class="opacity-50" /> {{ $t('activities.materials.title') }}
                    </h2>
                    <ul class="flex flex-col gap-1">
                        <li v-for="material in activity.materials" :key="material.id"
                            class="flex justify-between gap-2">
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
            </div>

            <div class="sticky bottom-14 flex gap-4 justify-center p-2">
                <button type="button" class="btn btn-soft btn-square btn-lg">
                    <PlayIcon />
                </button>
                <button type="button" class="btn btn-soft btn-square btn-lg" disabled>
                    <PresentationIcon />
                </button>
                <button type="button" class="btn btn-soft btn-square btn-lg" disabled>
                    <HeartIcon />
                </button>
            </div>
        </div>
    </Container>
</template>
