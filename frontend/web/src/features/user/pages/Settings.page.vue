<script setup lang="ts">
import Container from '@chapelure/ui/layout/Container.vue';
import { useNavbar } from '@chapelure/ui/layout/useNavbar';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

useNavbar(t('user.settings.title'));
</script>

<template>
    <Container>
        <div class="join join-vertical">
            <button class="btn join-item">Theme</button>
            <button class="btn join-item">Button</button>
            <button class="btn join-item">Button</button>
        </div>
    </Container>
</template>
