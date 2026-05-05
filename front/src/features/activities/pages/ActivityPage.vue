<script setup lang="ts">
import { activities, type ActivityData } from '@features/activities/data/activities';
import { ref } from 'vue';
import Group from '@chapelure/common/components/layout/Group.vue';
import Container from '@chapelure/common/components/layout/Container.vue';
import { ArrowLeftIcon, CalendarIcon, FileTextIcon, HeartIcon, ListOrderedIcon, MonitorPlayIcon, PackageOpenIcon, ScrollTextIcon } from 'lucide-vue-next';
import List from '@chapelure/common/components/data/List.vue';
import { watch } from 'vue';
import { useRoute } from 'vue-router';
import BenefitsDisplay from '@features/activities/components/BenefitsDisplay.vue';
import AcitivityMetadaDisplay from '@features/activities/components/AcitivityMetadaDisplay.vue';
import { routesNames as activitiesRoutesNames } from '@features/activities/routes';

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
    <div class="flex gap-2 justify-end">
        <button></button>
    </div>
    <Container>
        <div class="sticky top-0 flex gap-2 py-1 bg-base-100">
            <RouterLink :to="{ name: activitiesRoutesNames.all }" class="btn btn-ghost">
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
        <Group>
            <img class="max-h-32 object-cover rounded-box" src="https://placeholder.pagebee.io/api/plain/800/200" />
            <div class="flex flex-1 gap-1 flex-col">
                <div class="flex justify-between">
                    <h2 class="text-2xl">{{ activity?.name }}</h2>
                    <AcitivityMetadaDisplay :activity="activity ?? undefined" />
                </div>
                <p>{{ activity?.summary }}</p>
                <BenefitsDisplay :benefits="activity?.expand.benefits" />
            </div>
        </Group>
        <Group>
            <h2 class="text-2xl flex items-center gap-2">
                <PackageOpenIcon /> {{ $t('activities.materials') }}
            </h2>
            <div class="flex gap-2">
                <div class="text-center" v-for="material in activity?.expand.materials">
                    <img class="size-24 rounded-box" src="https://placeholder.pagebee.io/api/plain/128/128" />
                    <span>{{ material.name }}</span>
                </div>
            </div>
        </Group>
        <Group>
            <h2 class="text-2xl flex items-center gap-2">
                <FileTextIcon /> {{ $t('activities.resources') }}
            </h2>
            <div class="flex gap-2">
                <div class="text-center" v-for="material in activity?.expand.resources">
                    <img class="size-24 rounded-box" src="https://placeholder.pagebee.io/api/plain/128/128" />
                    <span>{{ material.name }}</span>
                </div>
            </div>
        </Group>
        <Group>
            <h2 class="text-2xl flex items-center gap-2">
                <ScrollTextIcon /> {{ $t('activities.description') }}
            </h2>
            <p v-html="activity?.description"></p>
        </Group>
        <Group>
            <h2 class="text-2xl flex items-center gap-2">
                <ListOrderedIcon /> {{ $t('activities.steps') }}
            </h2>
            <List :items="activity?.expand.steps" v-slot="{ item, index }">
                <div class="text-4xl font-thin opacity-30 tabular-nums">{{ String(index + 1).padStart(2, '0') }}</div>
                <div>
                    <p class="text-xs" v-html="item.description"></p>
                </div>
            </List>
        </Group>
    </Container>
</template>