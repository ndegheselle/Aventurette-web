<script setup lang="ts">
import { createGroup } from '@chapelure/api/filters';
import List from '@chapelure/common/components/data/List.vue';
import Filters from '@chapelure/common/components/inputs/Filters.vue';
import Search from '@chapelure/common/components/inputs/Search.vue';
import Container from '@chapelure/common/components/layout/Container.vue';
import AcitivityMetadaDisplay from '@features/activities/components/AcitivityMetadaDisplay.vue';
import BenefitsDisplay from '@features/activities/components/BenefitsDisplay.vue';
import { activities, getUniqueBenefits, type ActivityData } from '@features/activities/data/activities';
import { definition } from '@features/activities/data/activities.filters';
import { routesNames } from '@features/activities/routes';
import { ArrowRightIcon, PlusIcon } from 'lucide-vue-next';
import { onMounted, ref } from 'vue';

const list = ref<ActivityData[]>([]);
const group = createGroup({filters: []});

onMounted(async () => {
    list.value = await activities.getAll();
});
</script>

<template>
    <Container>
        <div class="flex flex-none gap-1">
            <Search />
            <RouterLink :to="{ name: routesNames.edit.description, params: { id: 'new' } }" class="btn btn-primary">
                <PlusIcon />
                {{ $t('actions.add') }}
            </RouterLink>
        </div>
        <Filters :filters="definition" v-model="group"/>
        <List :items="list" v-slot="{ item }" class="flex-1">
            <div><img class="size-16 rounded-box" src="https://placeholder.pagebee.io/api/plain/64/64" /></div>
            <div>
                <div class="flex gap-2">
                    <b class="my-auto">{{ item.name }}</b>
                    <AcitivityMetadaDisplay :activity="item" />
                </div>
                <p class="text-xs" v-html="item.description"></p>
                <BenefitsDisplay class="mt-1" :benefits="getUniqueBenefits(item)" />
            </div>

            <RouterLink :to="{ name: routesNames.page, params: { id: item.id } }" class="btn btn-square btn-ghost my-auto">
                <ArrowRightIcon />
            </RouterLink>
        </List>
    </Container>
</template>