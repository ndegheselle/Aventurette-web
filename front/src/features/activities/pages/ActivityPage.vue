<script setup lang="ts">
import { activitiesRepository as activities } from '@features/activities/data/activities.repository';
import List from '@chapelure/ui/data/List.vue';
import { ArrowLeftIcon, CalendarIcon, FileTextIcon, HeartIcon, ListOrderedIcon, MonitorPlayIcon, PackageOpenIcon, ScrollTextIcon } from 'lucide-vue-next';
import Container from '@chapelure/ui/layout/Container.vue';
import Panel from '@chapelure/ui/layout/Panel.vue';
import Button from '@chapelure/ui/primitives/Button.vue';
import AcitivityMetadaDisplay from '@features/activities/components/activities/ActivityMetadaDisplay.vue';
import BenefitsDisplay from '@features/activities/components/BenefitsDisplay.vue';
import StepSummary from '@features/activities/components/steps/StepSummary.vue';
import { type ActivityData } from '@features/activities/model/activity';
import { routesNames as activitiesRoutesNames } from '@features/activities/routes';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const activity = ref<ActivityData | null>(null);

watch(
    () => route.params.id,
    async (id) => {
        if (typeof id != 'string')
            return;
        activity.value = await activities.getById(id);
    },
    { immediate: true }
);
</script>
<template>
    <Container>
        <div class="sticky top-0 flex gap-2 py-1 bg-base-100">
            <Button variant="ghost" :to="{ name: activitiesRoutesNames.all }">
                <ArrowLeftIcon /> {{ $t('actions.back') }}
            </Button>

            <Button class="ms-auto">
                <HeartIcon />
                {{ $t('activities.actions.favorite') }}
            </Button>
            <Button>
                <CalendarIcon />
                {{ $t('activities.actions.addToPlanning') }}
            </Button>
            <Button variant="primary">
                <MonitorPlayIcon />
                {{ $t('activities.actions.start') }}
            </Button>
        </div>
        <Panel>
            <img class="max-h-32 object-cover rounded-box" src="https://placeholder.pagebee.io/api/plain/800/200" />
            <div class="flex flex-1 gap-1 flex-col">
                <div class="flex justify-between">
                    <h2 class="text-2xl">{{ activity?.name }}</h2>
                    <AcitivityMetadaDisplay :activity="activity ?? undefined" />
                </div>
                <p>{{ activity?.summary }}</p>
                <BenefitsDisplay :benefits="activity?.expand.benefits" />
            </div>
        </Panel>
        <Panel>
            <h2 class="text-2xl flex items-center gap-2">
                <PackageOpenIcon /> {{ $t('activities.steps.fields.materials.title') }}
            </h2>
            <div class="flex gap-2">
                <div class="text-center" v-for="material in activity?.expand.materials" :key="material.id">
                    <img class="size-24 rounded-box" src="https://placeholder.pagebee.io/api/plain/128/128" />
                    <span>{{ material.name }}</span>
                </div>
            </div>
        </Panel>
        <Panel>
            <h2 class="text-2xl flex items-center gap-2">
                <FileTextIcon /> {{ $t('activities.steps.fields.resources.title') }}
            </h2>
            <div class="flex gap-2">
                <div class="text-center" v-for="resource in activity?.expand.resources" :key="resource.id">
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
            <List :items="activity?.expand.steps" v-slot="{ item, index }">
                <StepSummary :index="index" :step="item" />
            </List>
        </Panel>
    </Container>
</template>
