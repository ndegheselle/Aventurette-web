<!--
  The app's only button. Renders a <button>, or a RouterLink when `to` is given, so that
  link-buttons stop being hand-written as <RouterLink class="btn btn-primary">.

    <Button variant="primary" @click="save">Save</Button>
    <Button :to="{ name: routes.list }" shape="square" variant="ghost"><ArrowLeftIcon /></Button>
-->
<script setup lang="ts">
import { BUTTON_GROUP, buttonClasses, type ButtonShape, type ButtonSize, type ButtonVariant } from '@chapelure/ui/primitives/buttonClasses';
import { computed, inject } from 'vue';
import { RouterLink, type RouteLocationRaw } from 'vue-router';

const {
    variant = 'default',
    size = 'md',
    shape = 'default',
    active = false,
    loading = false,
    disabled = false,
    block = false,
    to = undefined,
    type = 'button',
} = defineProps<{
    variant?: ButtonVariant;
    size?: ButtonSize;
    shape?: ButtonShape;
    active?: boolean;
    loading?: boolean;
    disabled?: boolean;
    /** Full width. */
    block?: boolean;
    /** When set, the button renders as a router link. */
    to?: RouteLocationRaw;
    type?: 'button' | 'submit' | 'reset';
}>();

const isGrouped = inject(BUTTON_GROUP, false);

const classes = computed(() => [
    ...buttonClasses({ variant, size, shape, active, block }),
    isGrouped ? 'join-item' : '',
].filter(Boolean));

// A router link takes no disabled/type; a button takes no `to`.
const tagProps = computed(() => to
    ? { to }
    : { type, disabled: disabled || loading });
</script>

<template>
    <component :is="to ? RouterLink : 'button'"
               :class="classes"
               v-bind="tagProps">
        <span v-if="loading" class="loading loading-spinner loading-sm"></span>
        <slot />
    </component>
</template>
