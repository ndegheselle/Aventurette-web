<!--
  A labelled control with its validation message. `label` is a translation key; use the #label
  slot instead when the legend needs markup, such as a leading icon.
-->
<script lang="ts" setup>
import FieldError from '@chapelure/ui/forms/FieldError.vue';
import { Label } from '@chapelure/ui/shadcn/label';

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
    <div class="flex flex-col gap-2" :data-invalid="!!error || undefined">
        <Label v-if="label || $slots.label"
               :class="{ 'text-destructive': error }">
            <slot name="label">{{ $t(label!) }}</slot>
        </Label>
        <slot></slot>
        <FieldError :error />
    </div>
</template>
