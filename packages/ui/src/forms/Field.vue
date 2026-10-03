<!--
  A labelled control with its validation message. `label` is a translation key; use the #label
  slot instead when the legend needs markup, such as a leading icon.
-->
<script setup vapor lang="ts">
import FieldError from '@chapelure/ui/forms/FieldError.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineProps<{
    label?: string,
    error?: string
}>();

const slots = defineSlots<{
    default(): any;
    label?(): any;
}>();
</script>

<template>
    <div class="flex flex-col">
        <legend v-if="label || slots.label"
                class="fieldset-legend"
                :class="{ 'text-error': error }">
            <slot name="label">{{ t(label!) }}</slot>
        </legend>
        <slot></slot>
        <FieldError :error />
    </div>
</template>
