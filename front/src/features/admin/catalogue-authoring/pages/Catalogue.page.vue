<script setup lang="ts">
import Container from '@chapelure/ui/layout/Container.vue';
import { useNavbar } from '@chapelure/ui/layout/useNavbar';
import { routesNames } from '@features/admin/catalogue-authoring/routes';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

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
        <div role="tablist"
             class="tabs tabs-box">
            <RouterLink v-for="tab in tabs"
                        :key="tab.to"
                        role="tab"
                        class="tab"
                        active-class="tab-active"
                        :to="{ name: tab.to }">
                {{ $t(tab.label) }}
            </RouterLink>
        </div>

        <RouterView />
    </Container>
</template>
