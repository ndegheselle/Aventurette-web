<script setup lang="ts">
import { computed } from 'vue';

const { size = 'md' } = defineProps<{
    size?: 'xs' | 'sm' | 'md' | 'lg';
}>();

const SIZES = { xs: 'loading-xs', sm: 'loading-sm', md: '', lg: 'loading-lg' };

const classes = computed(() => ['loading', 'loading-spinner', SIZES[size]].filter(Boolean));
</script>

<template>
    <span :class="classes"></span>
</template>
