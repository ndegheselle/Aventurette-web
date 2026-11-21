<!-- Example : <List :items="list" v-slot="{ item, index }"></List>
     A row is a flex line: give the part that should take the room left `flex-1`. -->
<script setup lang="ts" generic="T extends BaseEntity">
import type { BaseEntity } from '@chapelure/core';
import { CircleQuestionMarkIcon } from 'lucide-vue-next';
defineProps<{
    items?: T[];
}>();

defineSlots<{
    default(props: { item: T, index: number }): any;
}>();
</script>

<template>
    <ul class="flex flex-col divide-y rounded-xl border bg-card text-card-foreground">
        <li class="mx-auto my-auto p-4 tracking-wide text-muted-foreground" v-if="!items?.length">
            <div class="flex">
                <CircleQuestionMarkIcon class="mr-2 my-auto" />
                <span>{{ $t('data.noData') }}</span>
            </div>
        </li>

        <li v-for="(item, index) in items" :key="item.id" class="flex items-center gap-4 p-4 duration-300">
            <slot :item="item" :index="index" />
        </li>
    </ul>
</template>
