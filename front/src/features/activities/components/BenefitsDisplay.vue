<script setup lang="ts">
import type { BenefitData } from '@features/activities/composables/data/benefits';

const { benefits } = defineProps<{
    benefits?: BenefitData[]
}>();
</script>

<template>
    <div class="flex gap-1">
        <span class="badge badge-soft" v-for="benefit in benefits">{{ benefit.name }}</span>
    </div>
</template>