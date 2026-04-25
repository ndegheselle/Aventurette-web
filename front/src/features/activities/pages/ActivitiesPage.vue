<script setup lang="ts">
import List from '@chapelure/common/components/data/List.vue';
import Filters from '@chapelure/common/components/inputs/Filters.vue';
import Search from '@chapelure/common/components/inputs/Search.vue';
import Container from '@chapelure/common/components/layout/Container.vue';
import { activities, type ActivityData } from '@features/activities/data/activities';
import { PlusIcon } from 'lucide-vue-next';
import { onMounted, ref } from 'vue';
import { filters } from '@features/activities/data/activities.filters';
import { routesNames } from '@features/activities/routes';
const list = ref<ActivityData[]>([]);

onMounted(async () => {
    list.value = await activities.getAll();
});
</script>

<template>
    <Container>
        <div class="flex flex-none gap-1">
            <Search />
            <button class="btn btn-primary">
                <PlusIcon />
                {{ $t('actions.add') }}
            </button>
        </div>
        <Filters :filters="filters" />
        <List :items="list" v-slot="{ item, index }" class="flex-1">
            <div><img class="size-10 rounded-box" src="https://placeholder.pagebee.io/api/plain/64/64" /></div>
            <RouterLink :to="{name: routesNames.page, params: {id: item.id}}">
                {{ item.id }}
            </RouterLink>
            <span>{{ index }}</span>
        </List>
    </Container>
</template>