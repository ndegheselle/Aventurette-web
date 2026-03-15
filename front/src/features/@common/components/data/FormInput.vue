<script lang="ts" setup>
const model = defineModel<string | number | null>();

defineProps<{
  label: any,
  error?: string
}>();

defineOptions({
  inheritAttrs: false
});
</script>

<template>
  <div class="form-control w-full">
    <label v-if="label"
           class="label" :class="{ 'text-error': error }">
      <span class="label-text">{{ label }}</span>
    </label>
    <input class="input input-bordered w-full"
           :class="{ 'input-error': error }"
           v-bind="$attrs"
           v-model="model" />
    <small v-if="error"
           class="text-error mt-1">
      <i class="fa-solid fa-triangle-exclamation"></i>
      {{ error }}
    </small>
  </div>
</template>