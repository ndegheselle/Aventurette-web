<script setup lang="ts">
import Badge from '@chapelure/ui/primitives/Badge.vue';
import { type InterestData } from '@features/users/composables/data/interests';
const props = defineProps<{ interests?: InterestData[] }>();
</script>

<template>
    <div class="flex flex-wrap gap-1">
        <Badge v-for="interest in props.interests ?? []" :key="interest.id">
            {{ interest.name }}
        </Badge>
    </div>
</template>
