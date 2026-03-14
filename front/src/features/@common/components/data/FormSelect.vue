<script lang="ts" setup>
const model = defineModel<string | number | null>();

defineProps<{
    label: string
    error?: { message: string }
}>();

defineOptions({
    inheritAttrs: false
});
</script>

<template>
    <div class="form-control w-full">
        <label v-if="label"
               class="label">
            <span class="label-text">{{ label }}</span>
        </label>

        <select class="select select-bordered w-full"
                :class="{ 'select-error': error }"
                v-bind="$attrs"
                v-model="model">
            <slot />
        </select>

        <small v-if="error"
               class="text-error mt-1">
            <i class="fa-solid fa-triangle-exclamation"></i>
            {{ error.message }}
        </small>
    </div>
</template>
