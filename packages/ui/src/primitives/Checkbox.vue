<script setup lang="ts">
import { computed } from 'vue';

const { size = 'md' } = defineProps<{
    size?: 'xs' | 'sm' | 'md' | 'lg';
    /** Forwarded to the native input so the box can drive an array model. */
    value?: unknown;
}>();

const model = defineModel<any>();

const SIZES = { xs: 'checkbox-xs', sm: 'checkbox-sm', md: '', lg: 'checkbox-lg' };

const classes = computed(() => ['checkbox', SIZES[size]].filter(Boolean));
</script>

<template>
    <input type="checkbox"
           :class="classes"
           :value="value"
           v-model="model" />
</template>
