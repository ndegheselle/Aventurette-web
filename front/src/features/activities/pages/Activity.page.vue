<script setup lang="ts">
import List from '@chapelure/ui/data/List.vue';
import Container from '@chapelure/ui/layout/Container.vue';
import Panel from '@chapelure/ui/layout/Panel.vue';
import StepSummary from '@features/activities/components/StepSummary.vue';
import { useActivity } from '@features/activities/composables/useActivity';
import { routesNames as activitiesRoutesNames } from '@features/activities/routes';
import { ArrowLeftIcon, CalendarIcon, FileTextIcon, HeartIcon, ListOrderedIcon, MonitorPlayIcon, PackageOpenIcon, ScrollTextIcon } from 'lucide-vue-next';

const { activity, materials, resources } = useActivity();
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
                <p v-html="activity?.description"></p>
            </div>
        </Panel>
        <Panel v-if="materials.length">
            <h2 class="text-2xl flex items-center gap-2">
                <PackageOpenIcon /> {{ $t('activities.steps.fields.materials.title') }}
            </h2>
            <div class="flex gap-2">
                <div class="text-center" v-for="material in materials" :key="material.id">
                    <img class="size-24 rounded-box" src="https://placeholder.pagebee.io/api/plain/128/128" />
                    <span>{{ material.name }}</span>
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
