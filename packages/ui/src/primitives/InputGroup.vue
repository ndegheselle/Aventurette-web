<!--
  One input surface holding an icon, a bare <input class="grow">, and optional trailing controls.

    <InputGroup :error="!!error">
      <MailIcon class="opacity-50" />
      <input class="grow" v-model="email" />
    </InputGroup>
-->
<script setup lang="ts">
import { computed } from 'vue';

const {
    size = 'md',
    error = false,
} = defineProps<{
    size?: 'xs' | 'sm' | 'md' | 'lg';
    error?: boolean;
}>();

const SIZES = { xs: 'input-xs', sm: 'input-sm', md: '', lg: 'input-lg' };

const classes = computed(() => ['input', SIZES[size], error ? 'input-error' : ''].filter(Boolean));
</script>

<template>
    <label :class="classes">
        <slot />
    </label>
</template>
