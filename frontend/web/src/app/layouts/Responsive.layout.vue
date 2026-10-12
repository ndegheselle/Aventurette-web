<script setup lang="ts">
import Desktop from '@/app/layouts/Desktop.layout.vue';
import Mobile from '@/app/layouts/Mobile.layout.vue';
import { useIsMobile } from '@chapelure/ui/layout/useIsMobile';

const { isMobile } = useIsMobile();
</script>

<template>
    <Mobile v-if="isMobile" />
    <Desktop v-else />
</template>
