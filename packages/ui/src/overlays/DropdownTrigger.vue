<!--
  Button-styled trigger for <Dropdown>.

  It has to stay a real <summary>, because the dropdown is a native <details> disclosure —
  swapping in a <button> would break it. So the button look comes from the shared class
  helper rather than from wrapping <Button>.
-->
<script setup lang="ts">
import { buttonClasses, type ButtonShape, type ButtonSize, type ButtonVariant } from '@chapelure/ui/primitives/buttonClasses';
import { computed } from 'vue';

const {
    variant = 'ghost',
    size = 'md',
    shape = 'square',
} = defineProps<{
    variant?: ButtonVariant;
    size?: ButtonSize;
    shape?: ButtonShape;
}>();

const classes = computed(() => buttonClasses({ variant, size, shape }));
</script>

<template>
    <summary :class="classes">
        <slot />
    </summary>
</template>
