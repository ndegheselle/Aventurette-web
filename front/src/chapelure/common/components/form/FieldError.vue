<script lang="ts" setup>
import { TriangleAlert } from 'lucide-vue-next';

defineProps<{
    error?: string
}>();
</script>

<template>
    <span v-if="error"
           class="text-error mt-1">
        <TriangleAlert class="inline mr-1 icon-sm" />
        {{ error }}
    </span>
</template>
