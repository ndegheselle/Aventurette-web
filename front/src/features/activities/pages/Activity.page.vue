<script setup lang="ts">
import List from '@chapelure/ui/data/List.vue';
import Container from '@chapelure/ui/layout/Container.vue';
import Panel from '@chapelure/ui/layout/Panel.vue';
import StepSummary from '@features/activities/components/StepSummary.vue';
import { useActivity } from '@features/activities/composables/useActivity';
import { routesNames as activitiesRoutesNames } from '@features/activities/routes';
import { ArrowLeftIcon, CalendarIcon, FileTextIcon, HeartIcon, InfoIcon, ListOrderedIcon, MonitorPlayIcon, PackageOpenIcon, ScrollTextIcon, ShieldAlertIcon, UsersIcon } from 'lucide-vue-next';

const { activity, resources, timing, ageLabel, participantsLabel } = useActivity();
</script>
<template>
    <Container>
        <div class="sticky top-0 flex gap-2 py-1 bg-base-100">
            <RouterLink class="btn btn-ghost" :to="{ name: activitiesRoutesNames.all }">
                <ArrowLeftIcon /> {{ $t('actions.back') }}
            </RouterLink>

            <button class="btn ms-auto">
                <HeartIcon />
                {{ $t('activities.actions.favorite') }}
            </button>
            <button class="btn">
                <CalendarIcon />
                {{ $t('activities.actions.addToPlanning') }}
            </button>
            <button class="btn btn-primary">
                <MonitorPlayIcon />
                {{ $t('activities.actions.start') }}
            </button>
        </div>
        <Panel>
            <img class="max-h-32 object-cover rounded-box" src="https://placeholder.pagebee.io/api/plain/800/200" />
            <div class="flex flex-1 gap-1 flex-col">
                <h2 class="text-2xl">{{ activity?.name }}</h2>
                <div class="flex flex-wrap gap-1">
                    <span v-if="activity?.classification.format" class="badge badge-primary">
                        {{ $t(`activities.format.${activity.classification.format}`) }}
                    </span>
                    <span v-for="theme in activity?.classification.themes" :key="theme.id" class="badge">
                        {{ theme.name }}
                    </span>
                </div>
            </div>
        </Panel>
        <Panel v-if="activity">
            <h2 class="text-2xl flex items-center gap-2">
                <InfoIcon /> {{ $t('activities.families.informations') }}
            </h2>
            <dl class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                    <dt class="text-sm opacity-60">{{ $t('activities.fields.age') }}</dt>
                    <dd>{{ $t(ageLabel.key, ageLabel.params) }}</dd>
                </div>
                <div>
                    <dt class="text-sm opacity-60">{{ $t('activities.fields.participants') }}</dt>
                    <dd>{{ $t(participantsLabel.key, participantsLabel.params) }}</dd>
                </div>
                <div>
                    <dt class="text-sm opacity-60">{{ $t('activities.fields.preparationTime') }}</dt>
                    <dd>{{ $t('activities.minutes', { minutes: timing.preparation }) }}</dd>
                </div>
                <div>
                    <dt class="text-sm opacity-60">{{ $t('activities.fields.playTime') }}</dt>
                    <dd>{{ $t('activities.minutes', { minutes: timing.play }) }}</dd>
                </div>
                <div>
                    <dt class="text-sm opacity-60">{{ $t('activities.families.place') }}</dt>
                    <dd class="flex flex-wrap gap-1">
                        <span v-if="activity.place.indoor" class="badge">{{ $t('activities.fields.indoor') }}</span>
                        <span v-if="activity.place.outdoor" class="badge">{{ $t('activities.fields.outdoor') }}</span>
                    </dd>
                </div>
                <div v-if="activity.audience.childrenPace">
                    <dt class="text-sm opacity-60">{{ $t('activities.fields.childrenPace') }}</dt>
                    <dd>{{ $t(`activities.childrenPace.${activity.audience.childrenPace}`) }}</dd>
                </div>
                <div v-if="activity.supervision.hostEffort">
                    <dt class="text-sm opacity-60">{{ $t('activities.fields.hostEffort') }}</dt>
                    <dd>{{ $t(`activities.hostEffort.${activity.supervision.hostEffort}`) }}</dd>
                </div>
                <div v-if="activity.supervision.hostsRequired">
                    <dt class="text-sm opacity-60">{{ $t('activities.fields.hosts') }}</dt>
                    <dd>{{ activity.supervision.hostsRequired }}</dd>
                </div>
            </dl>
            <div v-if="activity.pedagogy.idealFor.length" class="flex flex-wrap items-center gap-1">
                <span class="text-sm opacity-60">{{ $t('activities.tagType.IDEAL_FOR') }}</span>
                <span v-for="tag in activity.pedagogy.idealFor" :key="tag.id" class="badge badge-outline">{{ tag.name }}</span>
            </div>
            <div v-if="activity.place.conditions">
                <h3 class="text-sm opacity-60">{{ $t('activities.fields.conditions') }}</h3>
                <div v-html="activity.place.conditions"></div>
            </div>
        </Panel>
        <Panel v-if="activity?.safety.tags.length">
            <h2 class="text-2xl flex items-center gap-2">
                <ShieldAlertIcon /> {{ $t('activities.families.safety') }}
            </h2>
            <div class="flex flex-wrap gap-1">
                <span v-for="tag in activity.safety.tags" :key="tag.id" class="badge badge-warning">{{ tag.name }}</span>
            </div>
        </Panel>
        <Panel v-if="activity?.materials.length">
            <h2 class="text-2xl flex items-center gap-2">
                <PackageOpenIcon /> {{ $t('activities.materials.title') }}
            </h2>
            <div class="flex flex-wrap gap-2">
                <div class="text-center" v-for="material in activity.materials" :key="material.id">
                    <img class="size-24 rounded-box" src="https://placeholder.pagebee.io/api/plain/128/128" />
                    <span>{{ material.name }}</span>
                    <span v-if="material.quantity" class="block text-xs opacity-60">{{ material.quantity }}</span>
                </div>
            </div>
        </Panel>
        <Panel v-if="resources.length">
            <h2 class="text-2xl flex items-center gap-2">
                <FileTextIcon /> {{ $t('activities.steps.fields.resources.title') }}
            </h2>
            <div class="flex gap-2">
                <div class="text-center" v-for="resource in resources" :key="resource.id">
                    <img class="size-24 rounded-box" src="https://placeholder.pagebee.io/api/plain/128/128" />
                    <span>{{ resource.name }}</span>
                </div>
            </div>
        </Panel>
        <Panel>
            <h2 class="text-2xl flex items-center gap-2">
                <ScrollTextIcon /> {{ $t('activities.description') }}
            </h2>
            <p v-html="activity?.description"></p>
        </Panel>
        <Panel v-if="activity?.workshops.length">
            <h2 class="text-2xl flex items-center gap-2">
                <UsersIcon /> {{ $t('activities.workshops.title') }}
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
            <h2 class="text-2xl flex items-center gap-2">
                <ListOrderedIcon /> {{ $t('activities.steps.title') }}
            </h2>
            <List :items="activity?.steps" v-slot="{ item, index }">
                <StepSummary :index="index" :step="item" />
            </List>
        </Panel>
    </Container>
</template>
