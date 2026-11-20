<!-- The user's space: their planning, their favorites and, later, their history. Each tab is a
     route of its own, shown below them; the features they come from do not know they are tabs. -->
<script setup lang="ts">
import Container from '@chapelure/ui/layout/Container.vue';
import { routesNames as activitiesRoutesNames } from '@features/activities/routes';
import { routesNames as planningRoutesNames } from '@features/planning/routes';
</script>

<template>
    <Container>
        <!-- Sticky: the page scrolls, the tabs stay under the top edge. Links rather than shadcn's
             Tabs, which hold their own state: here the route is the state. -->
        <div class="sticky top-0 z-10 bg-background p-2">
            <nav role="tablist"
                 class="inline-flex h-9 items-center rounded-lg bg-muted p-[3px] text-muted-foreground [&>*]:inline-flex [&>*]:h-full [&>*]:items-center [&>*]:rounded-md [&>*]:px-3 [&>*]:text-sm [&>*]:font-medium">
                <RouterLink role="tab" exact-active-class="bg-background text-foreground shadow-sm"
                            :to="{ name: planningRoutesNames.planning }">
                    {{ $t('space.tabs.planning') }}
                </RouterLink>
                <RouterLink role="tab" exact-active-class="bg-background text-foreground shadow-sm"
                            :to="{ name: activitiesRoutesNames.favorites }">
                    {{ $t('space.tabs.favorites') }}
                </RouterLink>
                <!-- XXX : no history yet. -->
                <a role="tab" aria-disabled="true" class="pointer-events-none opacity-50">{{ $t('space.tabs.history') }}</a>
            </nav>
        </div>

        <RouterView />
    </Container>
</template>
