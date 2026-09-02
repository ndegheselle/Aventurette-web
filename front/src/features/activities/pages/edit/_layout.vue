<script setup lang="ts">
import { activitiesApi as activities } from '@features/activities/api/activities.api';
import { type ActivityData } from '@features/activities/model/activity';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const activity = ref<ActivityData | null>(null);

watch(
    () => route.params.id,
    async (id) => {
        if (typeof id != 'string')
            return;

        // New item created
        if (id == 'new')
            activity.value = {} as ActivityData;
        else
            activity.value = await activities.getById(id);
    },
    { immediate: true }
);
</script>

<template>
    <RouterView :activity="activity" />
</template>