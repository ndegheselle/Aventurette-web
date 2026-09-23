<!--
  A slider with two thumbs, bound as `v-model:min` and `v-model:max`. The thumbs stop at each
  other. An unset (`null`) end sits at its edge, and an end dragged to its edge is unset. Colour follows `currentColor`: put a
  `text-primary` on it at the call site.
-->
<script setup lang="ts">
import { clampHigh, clampLow, highOf, highValue, isLowOnTop, lowOf, lowValue, percentOf } from '@chapelure/ui/forms/range';
import { computed } from 'vue';

const props = withDefaults(defineProps<{
    floor?: number;
    ceiling?: number;
    step?: number;
    disabled?: boolean;
}>(), {
    floor: 0,
    ceiling: 100,
    step: 1,
});

const min = defineModel<number | null>('min');
const max = defineModel<number | null>('max');

const bounds = computed(() => ({ floor: props.floor, ceiling: props.ceiling }));
const low = computed(() => lowOf(bounds.value, min.value));
const high = computed(() => highOf(bounds.value, max.value));

function onLow(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = clampLow(input.valueAsNumber, high.value);
    // The native thumb has already moved; put it back when it was stopped.
    input.valueAsNumber = value;
    min.value = lowValue(bounds.value, value);
}

function onHigh(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = clampHigh(input.valueAsNumber, low.value);
    input.valueAsNumber = value;
    max.value = highValue(bounds.value, value);
}
</script>

<template>
    <div class="range-input relative w-full"
         :style="{
             '--low': percentOf(bounds, low),
             '--high': percentOf(bounds, high),
         }">
        <div class="range-track absolute rounded-full bg-current/10"></div>
        <div class="range-selected absolute rounded-full bg-current"></div>
        <input type="range" class="range range-sm absolute inset-0"
               :class="{ 'z-10': isLowOnTop(bounds, low) }"
               :min="floor" :max="ceiling" :step :disabled
               :value="low" :aria-label="$t('data.minimum')"
               @input="onLow" />
        <input type="range" class="range range-sm absolute inset-0"
               :min="floor" :max="ceiling" :step :disabled
               :value="high" :aria-label="$t('data.maximum')"
               @input="onHigh" />
    </div>
</template>

<style scoped>
/* daisyUI draws the fill as a shadow off one thumb; two thumbs share a track drawn here instead. */
.range-input {
    --range-thumb-size: calc(var(--size-selector, .25rem) * 5);
    height: var(--range-thumb-size);
}

.range {
    --range-fill: 0;
    --range-bg: transparent;
    width: 100%;
    pointer-events: none;
}

.range::-webkit-slider-runnable-track {
    border-color: transparent;
}

.range::-moz-range-track {
    border-color: transparent;
}

.range::-webkit-slider-thumb {
    pointer-events: auto;
}

.range::-moz-range-thumb {
    pointer-events: auto;
}

/* A thumb's centre travels from half a thumb in to half a thumb short of the end. */
.range-track,
.range-selected {
    top: 25%;
    height: 50%;
}

.range-track {
    inset-inline: 0;
}

.range-selected {
    --travel: calc(100% - var(--range-thumb-size));
    left: calc(var(--range-thumb-size) / 2 + var(--travel) * var(--low) / 100);
    right: calc(var(--range-thumb-size) / 2 + var(--travel) * (100 - var(--high)) / 100);
}
</style>
