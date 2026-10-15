<!-- A card in a list. The "more" button only emits: the parent owns the single ActivityCardOptions sheet. -->
<script setup lang="ts">
import type { ActivityData } from '@features/activities/models/activity';
import { EllipsisVerticalIcon } from 'lucide-vue-next';

defineProps<{
    activity: ActivityData;
}>();

defineEmits<{
    more: [];
}>();
</script>

<template>
    <div class="card bg-base-100 shadow-sm">
        <figure>
            <img src="https://placeholder.pagebee.io/api/plain/256/512" alt="" class="size-full object-cover" />
        </figure>
        <div class="flex justify-between">
            <span>{{ activity.name }}</span>
            <button class="btn btn-sm btn-circle" :aria-label="$t('activities.card.more')" @click="$emit('more')">
                <EllipsisVerticalIcon />
            </button>
        </div>
    </div>
</template>
