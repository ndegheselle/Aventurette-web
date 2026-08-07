<script setup lang="ts">
defineSlots<{
    default(): any;
    summary(): any;
}>();

const { isFullWidth } = defineProps<{
    isFullWidth?: boolean;
}>();

const model = defineModel<boolean>({ default: false });

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
        :open="model"
        @toggle="model = ($event.target as HTMLDetailsElement).open"
    >
        <slot name="summary" />
        <div class="dropdown-content bg-base-100 rounded-box shadow-md" :class="{'right-0 left-0': isFullWidth}" @click="closeOnInteractible">
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
/* Fix dropdown position in modal with scroll */
.modal .dropdown-content  {
    position:fixed;
}
</style>