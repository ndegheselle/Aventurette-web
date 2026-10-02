<script setup lang="ts">
import List from '@chapelure/ui/data/List.vue';
import Container from '@chapelure/ui/layout/Container.vue';
import Panel from '@chapelure/ui/layout/Panel.vue';
import ActivityNotices from '@features/activities/components/ActivityNotices.vue';
import StepSummary from '@features/activities/components/StepSummary.vue';
import { useActivity } from '@features/activities/composables/useActivity';
import { routesNames as activitiesRoutesNames } from '@features/activities/routes';
import { ArrowLeftIcon, CakeIcon, CalendarIcon, ClockIcon, CloudSunIcon, FileTextIcon, GaugeIcon, HeartIcon, HourglassIcon, ListOrderedIcon, MapPinIcon, MonitorPlayIcon, PackageOpenIcon, ScrollTextIcon, SparklesIcon, UserCheckIcon, UsersIcon, ZapIcon } from 'lucide-vue-next';

const { activity, resources, timing, ageLabel, participantsLabel } = useActivity();
</script>
<template>
    <Container>
        <div class="sticky top-0 flex gap-1 sm:gap-2 py-1 bg-base-100 z-10">
            <div class="tooltip tooltip-bottom sm:before:hidden sm:after:hidden"
                 :data-tip="$t('actions.back')">
                <RouterLink class="btn btn-ghost"
                            :to="{ name: activitiesRoutesNames.all }">
                    <ArrowLeftIcon />
                    <span class="sr-only sm:not-sr-only">{{ $t('actions.back') }}</span>
                </RouterLink>
            </div>
            <ActivityNotices v-if="activity"
                             :safety="activity.safety.instructions"
                             :tips="activity.tips" />

            <div class="tooltip tooltip-bottom sm:before:hidden sm:after:hidden ms-auto"
                 :data-tip="$t('activities.actions.favorite')">
                <button class="btn"
                        disabled>
                    <HeartIcon />
                    <span class="sr-only sm:not-sr-only">{{ $t('activities.actions.favorite') }}</span>
                </button>
            </div>
            <div class="tooltip tooltip-bottom sm:before:hidden sm:after:hidden"
                 :data-tip="$t('activities.actions.addToPlanning')">
                <button class="btn"
                        disabled>
                    <CalendarIcon />
                    <span class="sr-only sm:not-sr-only">{{ $t('activities.actions.addToPlanning') }}</span>
                </button>
            </div>
            <div class="tooltip tooltip-bottom sm:before:hidden sm:after:hidden"
                 :data-tip="$t('activities.actions.start')">
                <RouterLink v-if="activity"
                            class="btn btn-primary"
                            :to="{ name: activitiesRoutesNames.play, params: { id: activity.id } }">
                    <MonitorPlayIcon />
                    <span class="sr-only sm:not-sr-only">{{ $t('activities.actions.start') }}</span>
                </RouterLink>
                <button v-else
                        class="btn btn-primary"
                        disabled>
                    <MonitorPlayIcon />
                    <span class="sr-only sm:not-sr-only">{{ $t('activities.actions.start') }}</span>
                </button>
            </div>
        </div>
        <template v-if="activity">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Panel>
                    <img class="max-h-32 object-cover rounded-box"
                         src="https://placeholder.pagebee.io/api/plain/800/200" />
                    <div class="flex flex-1 gap-1 flex-col">
                        <h2 class="text-2xl">{{ activity.name }}</h2>
                        <div class="flex flex-wrap gap-1">
                            <span v-if="activity.classification.format"
                                  class="badge badge-primary">
                                {{ $t(`activities.format.${activity.classification.format}`) }}
                            </span>
                            <span v-for="theme in activity.classification.themes"
                                  :key="theme.id"
                                  class="badge">
                                {{ theme.name }}
                            </span>
                        </div>
                    </div>
                </Panel>
                <Panel>
                    <dl class="list">
                        <div class="list-row p-2">
                            <dt class="text-sm opacity-60 flex items-center gap-1">
                                <CakeIcon class="size-4" /> {{ $t('activities.fields.age') }}
                            </dt>
                            <dd class="ms-auto">{{ $t(ageLabel.key, ageLabel.params) }}</dd>
                        </div>
                        <div class="list-row p-2">
                            <dt class="text-sm opacity-60 flex items-center gap-1">
                                <UsersIcon class="size-4" /> {{ $t('activities.fields.participants') }}
                            </dt>
                            <dd class="ms-auto">{{ $t(participantsLabel.key, participantsLabel.params) }}</dd>
                        </div>
                        <div class="list-row p-2">
                            <dt class="text-sm opacity-60 flex items-center gap-1">
                                <HourglassIcon class="size-4" /> {{ $t('activities.fields.preparationTime') }}
                            </dt>
                            <dd class="ms-auto">{{ $t('activities.minutes', { minutes: timing.preparation }) }}</dd>
                        </div>
                        <div class="list-row p-2">
                            <dt class="text-sm opacity-60 flex items-center gap-1">
                                <ClockIcon class="size-4" /> {{ $t('activities.fields.playTime') }}
                            </dt>
                            <dd class="ms-auto">{{ $t('activities.minutes', { minutes: timing.play }) }}</dd>
                        </div>
                        <div class="list-row p-2">
                            <dt class="text-sm opacity-60 flex items-center gap-1">
                                <MapPinIcon class="size-4" /> {{ $t('activities.families.place') }}
                            </dt>
                            <dd class="flex flex-wrap gap-1 ms-auto">
                                <span v-if="activity.place.indoor"
                                      class="badge">{{ $t('activities.fields.indoor') }}</span>
                                <span v-if="activity.place.outdoor"
                                      class="badge">{{ $t('activities.fields.outdoor') }}</span>
                            </dd>
                        </div>
                        <div v-if="activity.audience.childrenPace" class="list-row p-2">
                            <dt class="text-sm opacity-60 flex items-center gap-1">
                                <GaugeIcon class="size-4" /> {{ $t('activities.fields.childrenPace') }}
                            </dt>
                            <dd class="ms-auto">{{ $t(`activities.childrenPace.${activity.audience.childrenPace}`) }}</dd>
                        </div>
                        <div v-if="activity.supervision.hostEffort" class="list-row p-2">
                            <dt class="text-sm opacity-60 flex items-center gap-1">
                                <ZapIcon class="size-4" /> {{ $t('activities.fields.hostEffort') }}
                            </dt>
                            <dd class="ms-auto">{{ $t(`activities.hostEffort.${activity.supervision.hostEffort}`) }}</dd>
                        </div>
                        <div v-if="activity.supervision.hostsRequired" class="list-row p-2">
                            <dt class="text-sm opacity-60 flex items-center gap-1">
                                <UserCheckIcon class="size-4" /> {{ $t('activities.fields.hosts') }}
                            </dt>
                            <dd class="ms-auto">{{ activity.supervision.hostsRequired }}</dd>
                        </div>
                    </dl>
                    <div v-if="activity.pedagogy.idealFor.length"
                         class="flex flex-wrap items-center gap-1">
                        <span class="text-sm opacity-60 flex items-center gap-1">
                            <SparklesIcon class="size-4" /> {{ $t('activities.tagType.IDEAL_FOR') }}
                        </span>
                        <span v-for="tag in activity.pedagogy.idealFor"
                              :key="tag.id"
                              class="badge badge-outline ms-auto">{{ tag.name }}</span>
                    </div>
                    <div v-if="activity.place.conditions">
                        <h3 class="text-sm opacity-60 flex items-center gap-1">
                            <CloudSunIcon class="size-4" /> {{ $t('activities.fields.conditions') }}
                        </h3>
                        <div v-html="activity.place.conditions" class="ms-auto"></div>
                    </div>
                </Panel>
            </div>

            <Panel v-if="activity.materials.length">
                <h2 class="text-2xl flex items-center gap-2">
                    <PackageOpenIcon /> {{ $t('activities.materials.title') }}
                </h2>
                <div class="flex flex-wrap gap-2">
                    <div class="text-center"
                         v-for="material in activity.materials"
                         :key="material.id">
                        <img class="size-24 rounded-box"
                             src="https://placeholder.pagebee.io/api/plain/128/128" />
                        <span>{{ material.name }}</span>
                        <span v-if="material.quantity"
                              class="block text-xs opacity-60">{{ material.quantity }}</span>
                    </div>
                </div>
            </Panel>
            <Panel v-if="resources.length">
                <h2 class="text-2xl flex items-center gap-2">
                    <FileTextIcon /> {{ $t('activities.steps.fields.resources.title') }}
                </h2>
                <div class="flex gap-2">
                    <div class="text-center"
                         v-for="resource in resources"
                         :key="resource.id">
                        <img class="size-24 rounded-box"
                             src="https://placeholder.pagebee.io/api/plain/128/128" />
                        <span>{{ resource.name }}</span>
                    </div>
                </div>
            </Panel>
            <Panel>
                <h2 class="text-2xl flex items-center gap-2">
                    <ScrollTextIcon class="opacity-50" /> {{ $t('activities.description') }}
                </h2>
                <p v-html="activity.description"></p>
            </Panel>
            <Panel v-if="activity.workshops.length">
                <h2 class="text-2xl flex items-center gap-2">
                    <UsersIcon class="opacity-50" /> {{ $t('activities.workshops.title') }}
                </h2>
                <List :items="activity.workshops"
                      v-slot="{ item }">
                    <div>
                        <b>{{ item.name }}</b>
                        <span v-if="item.theme"
                              class="ms-2 text-sm opacity-60">{{ item.theme }}</span>
                        <div class="text-xs"
                             v-html="item.challenges"></div>
                    </div>
                    <span v-if="item.adults_required"
                          class="badge">
                        {{ $t('activities.workshops.adults', { count: item.adults_required }) }}
                    </span>
                </List>
            </Panel>
            <Panel>
                <h2 class="text-2xl flex items-center gap-2">
                    <ListOrderedIcon class="opacity-50" /> {{ $t('activities.steps.title') }}
                </h2>
                <List :items="activity.steps"
                      v-slot="{ item, index }">
                    <StepSummary :index="index"
                                 :step="item" />
                </List>
            </Panel>
        </template>
    </Container>
</template>
