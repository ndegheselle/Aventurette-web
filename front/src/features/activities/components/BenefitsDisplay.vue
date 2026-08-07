<script setup lang="ts">
import Badge from '@chapelure/ui/primitives/Badge.vue';
import type { BenefitData } from '@features/activities/composables/data/benefits';

const { benefits } = defineProps<{
    benefits?: BenefitData[]
}>();
</script>

<template>
    <div class="flex gap-1">
        <Badge variant="soft" v-for="benefit in benefits" :key="benefit.id">{{ benefit.name }}</Badge>
    </div>
</template>
