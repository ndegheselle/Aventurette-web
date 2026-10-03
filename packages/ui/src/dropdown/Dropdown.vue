<script setup vapor lang="ts">
import { vClickOutside } from '@chapelure/ui/dropdown/clickOutside';
import { useId } from 'vue';

defineSlots<{
    default(): any;
    summary(): any;
}>();

const { isFullWidth } = defineProps<{
    isFullWidth?: boolean;
}>();

const model = defineModel<boolean>({ default: false });

const anchor = `--dropdown-${useId()}`;

function closeOnInteractible(event: MouseEvent)
{
    const interactible = (event.target as Element).closest?.('a, button, input, select, textarea, [role="button"], [role="menuitem"], [role="option"]');
    if (interactible)
        model.value = false;
}
</script>

<template>
    <details
        v-click-outside="() => model = false"
        class="dropdown"
        :style="{ anchorName: anchor }"
        :open="model"
        @toggle="model = ($event.target as HTMLDetailsElement).open"
    >
        <slot name="summary" />
        <div class="dropdown-content bg-base-200 rounded-box shadow-md"
            :class="{'right-0 left-0 full-width': isFullWidth}"
            :style="{ positionAnchor: anchor }"
            @click="closeOnInteractible">
            <slot />
        </div>
    </details>
</template>

<style scoped>
details>summary {
    list-style: none;
}

details>summary::-webkit-details-marker {
    display: none;
}
/* Fixed, so a modal's overflow neither clips it nor scrolls; anchored, so it stays under its summary. */
.modal .dropdown-content {
    position: fixed;
    top: anchor(bottom);
    left: anchor(left);
}

.modal .dropdown-content.full-width {
    right: auto;
    width: anchor-size(width);
}
</style>