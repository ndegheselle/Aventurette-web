<!--
  A slider with two thumbs, bound as `v-model:min` and `v-model:max`. The thumbs keep their
  order: dragged past each other, they swap. An unset (`null`) end sits at its edge, and an end
  dragged to its edge is unset.
-->
<script setup lang="ts">
import { highOf, highValue, lowOf, lowValue } from '@chapelure/ui/inputs/range';
import { Slider } from '@chapelure/ui/shadcn/slider';
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
const thumbs = computed(() => [lowOf(bounds.value, min.value), highOf(bounds.value, max.value)]);

function onSlide(values: number[] | undefined) {
    const [low, high] = values ?? thumbs.value;
    min.value = lowValue(bounds.value, low!);
    max.value = highValue(bounds.value, high!);
}
</script>

<template>
    <Slider class="py-2"
            :model-value="thumbs"
            :min="floor" :max="ceiling" :step :disabled
            thumb-alignment="contain"
            @update:model-value="onSlide" />
</template>
