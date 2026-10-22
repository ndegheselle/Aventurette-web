<!-- The library's tabs. Each tab is a route of its own, shown below them. -->
<script setup lang="ts">
import Container from '@chapelure/ui/layout/Container.vue';
import { routesNames as activitiesRoutesNames } from '@features/activities/routes';
</script>

<template>
    <Container>
        <!-- Sticky: the page scrolls, the tabs stay under the top edge. -->
        <div role="tablist" class="tabs tabs-border sticky top-0 z-10 bg-base-100 p-2">
            <RouterLink role="tab" class="tab" exact-active-class="tab-active"
                        :to="{ name: activitiesRoutesNames.library }">
                {{ $t('activities.library.tabs.catalogue') }}
            </RouterLink>
            <RouterLink role="tab" class="tab" exact-active-class="tab-active"
                        :to="{ name: activitiesRoutesNames.favorites }">
                {{ $t('activities.library.tabs.favorites') }}
            </RouterLink>
            <a role="tab" class="tab tab-disabled">{{ $t('activities.library.tabs.history') }}</a>
        </div>

        <RouterView />
    </Container>
</template>
