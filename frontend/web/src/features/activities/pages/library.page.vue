<script setup lang="ts">
import Container from '@chapelure/ui/layout/Container.vue';
</script>

<template>
    <Container>
        <!-- Sticky: the page scrolls, the tabs stay under the top edge. -->
        <div role="tablist" class="tabs tabs-border sticky top-0 z-10 bg-base-100 pb-1">
            <a role="tab" class="tab tab-active">{{ $t('activities.library.tabs.catalogue') }}</a>
            <a role="tab" class="tab">{{ $t('activities.library.tabs.favorites') }}</a>
            <a role="tab" class="tab">{{ $t('activities.library.tabs.history') }}</a>
        </div>

        <!-- Two columns, the second pushed down so the cards do not line up. -->
        <div class="grid grid-cols-2 gap-2">
            <div class="flex flex-col gap-2 mt-12">
                <div v-for="n in 6" :key="n" class="skeleton h-64 w-full"></div>
            </div>
            <div class="flex flex-col gap-2">
                <div v-for="n in 6" :key="n" class="skeleton h-64 w-full"></div>
            </div>
        </div>
    </Container>
</template>
