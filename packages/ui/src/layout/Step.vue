<script setup lang="ts">
import { computed } from 'vue';

const { done = false } = defineProps<{
    /** Marks this step as reached. */
    done?: boolean;
}>();

const classes = computed(() => ['step', done ? 'step-primary' : ''].filter(Boolean));
</script>

<template>
    <li :class="classes">
        <span class="flex gap-2 items-center">
            <slot />
        </span>
    </li>
</template>
