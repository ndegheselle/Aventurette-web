<script lang="ts" setup>
import FieldError from '@common/components/form/FieldError.vue';

defineProps<{
  label: any,
  error?: string
}>();
</script>

<template>
  <div class="form-control">
    <label v-if="label"
           class="label" :class="{ 'text-error': error }">
      <span class="label-text">{{ $t(label) }}</span>
    </label>
    <slot></slot>
    <FieldError :error />
  </div>
</template>