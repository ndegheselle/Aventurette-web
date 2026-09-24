<script setup lang="ts">
import List from '@chapelure/ui/data/List.vue';
import Pagination from '@chapelure/ui/data/Pagination.vue';
import SearchInput from '@chapelure/ui/data/SearchInput.vue';
import Container from '@chapelure/ui/layout/Container.vue';
import { useActivitiesList } from '@features/activities/composables/useActivitiesList';
import { routesNames } from '@features/activities/routes';
import { ArrowRightIcon } from 'lucide-vue-next';

const { paginated, search, refresh } = useActivitiesList();
</script>

<template>
    <Container>
        <SearchInput @search="() => refresh()"
                     v-model="search" />
        <List :items="paginated.items"
              v-slot="{ item }"
              class="flex-1">
            <div><img class="size-16 rounded-box"
                     src="https://placeholder.pagebee.io/api/plain/64/64" /></div>
            <div>
                <b>{{ item.name }}</b>
                <p class="text-xs"
                   v-html="item.description"></p>
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
