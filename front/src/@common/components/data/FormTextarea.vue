<script lang="ts" setup>
const model = defineModel<string | null>();

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

        <textarea class="textarea textarea-bordered w-full"
                  :class="{ 'textarea-error': error }"
                  v-bind="$attrs"
                  v-model="model"></textarea>

        <small v-if="error"
               class="text-error mt-1">
            <i class="fa-solid fa-triangle-exclamation"></i>
            {{ error.message }}
        </small>
    </div>
</template>
