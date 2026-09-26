<!-- Example : <List :items="list" v-slot="{ item, index }"></List> -->
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
    <ul class="list bg-base-100 rounded-box border border-base-content/5">
        <li class="p-4 opacity-30 tracking-wide my-auto mx-auto" v-if="!items?.length">
            <div class="flex ">
                <CircleQuestionMarkIcon class="mr-2 my-auto" />
                <span>{{ $t('data.noData') }}</span>
            </div>
        </li>

        <li v-for="(item, index) in items" :key="item.id" class="list-row duration-300">
            <slot :item="item" :index="index" />
        </li>
    </ul>
</template>