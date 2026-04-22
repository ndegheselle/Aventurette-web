<script setup lang="ts">
import Container from '@chapelure/common/components/layout/Container.vue'; import { onMounted, ref } from 'vue';
import { activities, type ActivityData } from '@features/activities/data/activities';
import List from '@chapelure/common/components/data/List.vue';
import Search from '@chapelure/common/components/inputs/Search.vue';
import { PlusIcon } from 'lucide-vue-next';

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
        <List :items="list" v-slot="{ item, index }" class="flex-1">
            <div><img class="size-10 rounded-box" src="https://placeholder.pagebee.io/api/plain/64/64" /></div>
            <span>{{ item }}</span>
            <span>{{ index }}</span>
        </List>
    </Container>
</template>