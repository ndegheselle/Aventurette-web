<!--
  A media card: optional image, a title, body content and an actions row.
  Distinct from <Panel>, which is a plain titled surface with no card chrome.
-->
<script setup lang="ts">
defineProps<{
    title?: string;
}>();

defineSlots<{
    media?(): any;
    default(): any;
    actions?(): any;
}>();
</script>

<template>
    <div class="card bg-base-100 border border-base-300">
        <figure v-if="$slots.media">
            <slot name="media" />
        </figure>
        <div class="card-body">
            <h2 v-if="title" class="card-title">{{ title }}</h2>
            <slot />
            <div v-if="$slots.actions" class="card-actions">
                <slot name="actions" />
            </div>
        </div>
    </div>
</template>
