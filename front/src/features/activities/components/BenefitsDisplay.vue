<script setup lang="ts">
import type { BenefitData } from '@features/activities/model/benefit';

const { benefits } = defineProps<{
    benefits?: BenefitData[]
}>();
</script>

<template>
    <div class="flex gap-1">
        <span class="badge badge-soft" v-for="benefit in benefits" :key="benefit.id">{{ benefit.name }}</span>
    </div>
</template>
