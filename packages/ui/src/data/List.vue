<!--
    A simple list
    Example : <List :items="list" v-slot="{ item, index }"></List>
-->
<script setup lang="ts" generic="T extends BaseEntity">
import type { BaseEntity } from '@chapelure/core';
import { CircleQuestionMarkIcon } from '@chapelure/ui/icons';
const props = defineProps<{
    items?: T[];
}>();

defineSlots<{
    default(props: { item: T, index: number }): any;
}>();
</script>

<template>
    <!-- List Container -->
    <ul class="list bg-base-100 rounded-box border border-base-content/5">
        <!-- Empty State -->
        <li class="p-4 opacity-30 tracking-wide my-auto mx-auto" v-if="!items?.length">
            <div class="flex ">
                <CircleQuestionMarkIcon class="mr-2 my-auto" />
                <span>{{ $t('data.noData') }}</span>
            </div>
        </li>

        <!-- List Items -->
        <li v-for="(item, index) in items" :key="item.id" class="list-row duration-300">
            <slot :item="item" :index="index" />
        </li>
    </ul>
</template>