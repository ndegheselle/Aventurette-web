<script setup lang="ts">
import { Paginated } from '@chapelure/api/crud';
import { createGroup, type FilterGroup } from '@chapelure/api/filters';
import List from '@chapelure/common/components/data/List.vue';
import Pagination from '@chapelure/common/components/data/Pagination.vue';
import Container from '@chapelure/common/components/layout/Container.vue';
import AcitivityMetadaDisplay from '@features/activities/components/AcitivityMetadaDisplay.vue';
import ActivitiesFilters from '@features/activities/components/ActivitiesFilters.vue';
import BenefitsDisplay from '@features/activities/components/BenefitsDisplay.vue';
import { useActivities, type ActivityData } from '@features/activities/composables/data/activities';
import { routesNames } from '@features/activities/routes';
import { ArrowRightIcon, PlusIcon } from 'lucide-vue-next';
import { onMounted, reactive, ref } from 'vue';

const activities = useActivities();
const paginated = ref<Paginated<ActivityData>>(new Paginated<ActivityData>([], 0, { page: 1, perPage: 5 }));
let group = reactive<FilterGroup<ActivityData>>(createGroup<ActivityData>({}));

onMounted(async () => {
    paginated.value = await activities.getList(paginated.value.options);
});

async function onChanged() {
    paginated.value = await activities.filter(group, paginated.value.options);
}
</script>

<template>
    <Container>
        <RouterLink :to="{ name: routesNames.edit.description, params: { id: 'new' } }"
                    class="btn btn-primary">
            <PlusIcon />
            {{ $t('actions.add') }}
        </RouterLink>
        <ActivitiesFilters @change="onChanged"
                           v-model="group" />
        <List :items="paginated.items"
              v-slot="{ item }"
              class="flex-1">
            <div><img class="size-16 rounded-box"
                     src="https://placeholder.pagebee.io/api/plain/64/64" /></div>
            <div>
                <div class="flex gap-2">
                    <b class="my-auto">{{ item.name }}</b>
                    <AcitivityMetadaDisplay :activity="item" />
                </div>
                <p class="text-xs"
                   v-html="item.description"></p>
                <BenefitsDisplay class="mt-1"
                                 :benefits="item.expand.benefits" />
            </div>

            <RouterLink :to="{ name: routesNames.page, params: { id: item.id } }"
                        class="btn btn-square btn-ghost my-auto">
                <ArrowRightIcon />
            </RouterLink>
        </List>
        <Pagination v-if="paginated.options.perPage < paginated.total"
                    :page="paginated.options.page"
                    :perPage="paginated.options.perPage"
                    :total="paginated.total"
                    @change="onChanged" />
    </Container>
</template>