<script setup lang="ts">
import Container from '@chapelure/ui/layout/Container.vue';
import { useNavbar } from '@chapelure/ui/layout/useNavbar';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

useNavbar(t('dashboard.title'));
</script>

<template>
    <Container>
        <div class="grid md:grid-cols-2 grid-cols-1 gap-2 flex-1">
            <div class="grid grid-cols-3 grid-rows-3 gap-2">
                <div class="skeleton col-span-2"></div>
                <div class="skeleton"></div>
                <div class="skeleton col-span-3 row-span-2"></div>
            </div>
            <div class="grid grid-cols-3 grid-rows-3 gap-2">
                <div class="skeleton row-span-2"></div>
                <div class="skeleton row-span-2"></div>
                <div class="skeleton"></div>
                <div class="skeleton"></div>
                <div class="skeleton"></div>
                <div class="skeleton col-span-2"></div>
            </div>
        </div>
    </Container>
</template>
