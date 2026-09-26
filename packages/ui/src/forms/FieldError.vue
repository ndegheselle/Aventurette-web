<script lang="ts" setup>
import { TriangleAlertIcon } from 'lucide-vue-next';

defineProps<{
    error?: string
}>();
</script>

<template>
    <span v-if="error"
           class="text-error mt-1">
        <TriangleAlertIcon class="inline mr-1 icon-sm" />
        {{ error }}
    </span>
</template>
