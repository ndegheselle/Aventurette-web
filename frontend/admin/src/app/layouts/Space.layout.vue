<!-- The user's space: their planning, their favorites and, later, their history. Each tab is a
     route of its own, shown below them; the features they come from do not know they are tabs. -->
<script setup lang="ts">
import Container from '@chapelure/ui/layout/Container.vue';
import { routesNames as activitiesRoutesNames } from '@features/activities/routes';
import { routesNames as planningRoutesNames } from '@features/planning/routes';
</script>

<template>
    <Container>
        <!-- Sticky: the page scrolls, the tabs stay under the top edge. -->
        <div role="tablist" class="tabs tabs-border sticky top-0 z-10 bg-base-100 p-2">
            <RouterLink role="tab" class="tab" exact-active-class="tab-active"
                        :to="{ name: planningRoutesNames.planning }">
                {{ $t('space.tabs.planning') }}
            </RouterLink>
            <RouterLink role="tab" class="tab" exact-active-class="tab-active"
                        :to="{ name: activitiesRoutesNames.favorites }">
                {{ $t('space.tabs.favorites') }}
            </RouterLink>
            <!-- XXX : no history yet. -->
            <a role="tab" class="tab tab-disabled">{{ $t('space.tabs.history') }}</a>
        </div>

        <RouterView />
    </Container>
</template>
