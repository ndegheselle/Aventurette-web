<script setup lang="ts">
import { computed } from 'vue';

const {
    variant = 'default',
    size = 'md',
} = defineProps<{
    variant?: 'default' | 'primary' | 'soft';
    size?: 'xs' | 'sm' | 'md';
}>();

const VARIANTS = { default: '', primary: 'badge-primary', soft: 'badge-soft' };
const SIZES = { xs: 'badge-xs', sm: 'badge-sm', md: '' };

const classes = computed(() => ['badge', VARIANTS[variant], SIZES[size]].filter(Boolean));
</script>

<template>
    <span :class="classes">
        <slot />
    </span>
</template>
