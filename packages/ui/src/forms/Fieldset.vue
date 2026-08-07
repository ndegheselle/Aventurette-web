<!-- Groups related <Field>s, with an optional legend. -->
<script setup lang="ts">
defineProps<{
    /** Already-translated text; pass $t(...) from the call site. */
    legend?: string;
}>();
</script>

<template>
    <fieldset class="fieldset">
        <legend v-if="legend" class="fieldset-legend">{{ legend }}</legend>
        <slot />
    </fieldset>
</template>
