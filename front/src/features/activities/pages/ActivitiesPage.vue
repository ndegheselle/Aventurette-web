<script setup lang="ts">
import { activitiesRepository as activities } from '@features/activities/data/activities.repository';
import { createGroup, Paginated, type FilterGroup } from '@chapelure/core';
import List from '@chapelure/ui/data/List.vue';
import Pagination from '@chapelure/ui/data/Pagination.vue';
import { ArrowRightIcon, PlusIcon } from '@chapelure/ui/icons';
import Container from '@chapelure/ui/layout/Container.vue';
import Button from '@chapelure/ui/primitives/Button.vue';
import ActivitiesFilters from '@features/activities/components/activities/ActivitiesFilters.vue';
import AcitivityMetadaDisplay from '@features/activities/components/activities/ActivityMetadaDisplay.vue';
import BenefitsDisplay from '@features/activities/components/BenefitsDisplay.vue';
import { type ActivityData } from '@features/activities/model/activity';
import { routesNames } from '@features/activities/routes';
import { onMounted, reactive, ref } from 'vue';

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
        <Button variant="primary"
                :to="{ name: routesNames.edit.description, params: { id: 'new' } }">
            <PlusIcon />
            {{ $t('actions.add') }}
        </Button>
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

            <Button shape="square"
                    variant="ghost"
                    class="my-auto"
                    :to="{ name: routesNames.page, params: { id: item.id } }">
                <ArrowRightIcon />
            </Button>
        </List>
        <Pagination v-if="paginated.options.perPage < paginated.total"
                    v-model:page="paginated.options.page"
                    v-model:perPage="paginated.options.perPage"
                    :total="paginated.total"
                    @change="onChanged" />
    </Container>
</template>
