<script setup lang="ts">
import Container from '@chapelure/ui/layout/Container.vue';
import { useNavbar } from '@chapelure/ui/layout/useNavbar';
import { Tabs, TabsList, TabsTrigger } from '@chapelure/ui/shadcn/tabs';
import { routesNames } from '@features/admin/catalogue-authoring/routes';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

const { t } = useI18n();
const route = useRoute();

const tabs = [
    { label: 'catalogue.materials.title', to: routesNames.materials },
    { label: 'catalogue.tags.title', to: routesNames.tags },
    { label: 'catalogue.safety.title', to: routesNames.safety },
    { label: 'catalogue.tips.title', to: routesNames.tips },
];

useNavbar(t('catalogue.title'));
</script>

<template>
    <Container>
        <!-- Each tab is a route: the one shown is the route's, and a tab navigates rather than switches. -->
        <Tabs :model-value="route.name as string"
              activation-mode="manual"
              class="my-2">
            <TabsList>
                <TabsTrigger v-for="tab in tabs"
                             :key="tab.to"
                             :value="tab.to"
                             as-child>
                    <RouterLink :to="{ name: tab.to }">
                        {{ $t(tab.label) }}
                    </RouterLink>
                </TabsTrigger>
            </TabsList>
        </Tabs>

        <RouterView />
    </Container>
</template>
