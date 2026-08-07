<!--
  Joins adjacent <Button>s into one segmented control.
  Children pick up the join styling through injection, so they need no extra prop.
-->
<script setup lang="ts">
import { BUTTON_GROUP } from '@chapelure/ui/primitives/buttonClasses';
import { provide } from 'vue';

provide(BUTTON_GROUP, true);
</script>

<template>
    <div class="join">
        <slot />
    </div>
</template>
