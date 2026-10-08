<script setup lang="ts">
import Default from '@/app/Default.layout.vue';
import Mobile from '@/app/Mobile.layout.vue';
import { useIsMobile } from '@chapelure/ui/layout/useIsMobile';

const { isMobile } = useIsMobile();
</script>

<template>
    <Mobile v-if="isMobile" />
    <Default v-else />
</template>
