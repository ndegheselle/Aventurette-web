<script setup lang="ts">
import { type InterestData } from '@features/users/model/interest';
const props = defineProps<{ interests?: InterestData[] }>();
</script>

<template>
    <div class="flex flex-wrap gap-1">
        <span class="badge" v-for="interest in props.interests ?? []" :key="interest.id">
            {{ interest.name }}
        </span>
    </div>
</template>
