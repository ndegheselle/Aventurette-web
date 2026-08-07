<!--
  A labelled control with its validation message.

  `label` is a translation key and is passed through $t. Use the #label slot instead when the
  legend needs markup, such as a leading icon.
-->
<script lang="ts" setup>
import FieldError from '@chapelure/ui/forms/FieldError.vue';

defineProps<{
    label?: string,
    error?: string
}>();

defineSlots<{
    default(): any;
    label?(): any;
}>();
</script>

<template>
    <div class="flex flex-col">
        <legend v-if="label || $slots.label"
                class="fieldset-legend"
                :class="{ 'text-error': error }">
            <slot name="label">{{ $t(label!) }}</slot>
        </legend>
        <slot></slot>
        <FieldError :error />
    </div>
</template>
