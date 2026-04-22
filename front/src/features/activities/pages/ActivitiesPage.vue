<<script setup lang="ts">
import ListPaginatedSearch from '@chapelure/common/components/data/ListPaginatedSearch.vue';
import Container from '@chapelure/common/components/layout/Container.vue';
import { activities } from '@features/activities/data/activities';
</script>

<template>
    <Container>
        <ListPaginatedSearch :items="activities">
            <template v-slot:row="{ item }">
                <div class="p-4 opacity-60 tracking-wide flex">
                    <div class="flex mx-auto">
                        <CircleQuestionMarkIcon class="mr-2 my-auto" />
                        {{ $t('activities.empty') }}
                    </div>
                </div>
            </template>
        </ListPaginatedSearch>
    </Container>
</template>