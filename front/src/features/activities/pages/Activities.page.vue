<script setup lang="ts">
import List from '@chapelure/ui/data/List.vue';
import Pagination from '@chapelure/ui/data/Pagination.vue';
import Container from '@chapelure/ui/layout/Container.vue';
import ActivitiesFilters from '@features/activities/components/activities/ActivitiesFilters.vue';
import AcitivityMetadaDisplay from '@features/activities/components/activities/ActivityMetadaDisplay.vue';
import BenefitsDisplay from '@features/activities/components/BenefitsDisplay.vue';
import { useActivitiesList } from '@features/activities/composables/useActivitiesList';
import { routesNames } from '@features/activities/routes';
import { ArrowRightIcon, PlusIcon } from 'lucide-vue-next';

const { paginated, filters, refresh } = useActivitiesList();
</script>

<template>
    <Container>
        <RouterLink class="btn btn-primary"
                    :to="{ name: routesNames.edit.description, params: { id: 'new' } }">
            <PlusIcon />
            {{ $t('actions.add') }}
        </RouterLink>
        <ActivitiesFilters @change="refresh"
                           v-model="filters" />
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
                                 :benefits="item.benefits" />
            </div>

            <RouterLink class="btn btn-ghost btn-square my-auto"
                        :to="{ name: routesNames.page, params: { id: item.id } }">
                <ArrowRightIcon />
            </RouterLink>
        </List>
        <Pagination v-if="paginated.options.perPage < paginated.total"
                    v-model:page="paginated.options.page"
                    v-model:perPage="paginated.options.perPage"
                    :total="paginated.total"
                    @change="refresh" />
    </Container>
</template>
