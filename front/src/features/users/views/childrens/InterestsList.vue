<script setup lang="ts">
import { type InterestData } from '@features/users/data/interests';
const props = defineProps<{ interests?: InterestData[] }>();
</script>

<template>
    <div class="flex flex-wrap gap-1">
        <span v-for="interest in props.interests ?? []" :key="interest.id" class="badge">
            {{ interest.name }}
        </span>
    </div>
</template>