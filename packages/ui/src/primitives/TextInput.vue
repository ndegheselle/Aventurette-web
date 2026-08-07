<!--
  Single-line input. Covers text, email, password, number and search.
  Pair with <Field> for a label and error message.
-->
<script setup lang="ts">
import { computed } from 'vue';

const {
    type = 'text',
    size = 'md',
    error = false,
    block = true,
} = defineProps<{
    type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';
    size?: 'xs' | 'sm' | 'md' | 'lg';
    /** Paints the error state; pass the boolean, keep the message on <Field>. */
    error?: boolean;
    /** Full width. On by default: every current use wants it. */
    block?: boolean;
}>();

const model = defineModel<string | number | null>();

const SIZES = { xs: 'input-xs', sm: 'input-sm', md: '', lg: 'input-lg' };

const classes = computed(() => [
    'input',
    SIZES[size],
    error ? 'input-error' : '',
    block ? 'w-full' : '',
].filter(Boolean));
</script>

<template>
    <input :type="type"
           :class="classes"
           v-model="model" />
</template>
