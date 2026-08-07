<script setup lang="ts">
import { computed } from 'vue';

const {
    size = 'md',
    error = false,
    block = true,
} = defineProps<{
    size?: 'xs' | 'sm' | 'md' | 'lg';
    error?: boolean;
    block?: boolean;
}>();

const model = defineModel<any>();

const SIZES = { xs: 'select-xs', sm: 'select-sm', md: '', lg: 'select-lg' };

const classes = computed(() => [
    'select',
    SIZES[size],
    error ? 'select-error' : '',
    block ? 'w-full' : '',
].filter(Boolean));
</script>

<template>
    <select :class="classes" v-model="model">
        <slot />
    </select>
</template>
