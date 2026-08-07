<script lang="ts" setup>
import FieldError from '@chapelure/common/components/form/FieldError.vue';

defineProps<{
    label: any,
    error?: string
}>();
</script>

<template>
    <div class="flex flex-col">
        <legend v-if="label" class="fieldset-legend" :class="{ 'text-error': error }">{{ $t(label) }}</legend>
        <slot></slot>
        <FieldError :error />
    </div>
</template>