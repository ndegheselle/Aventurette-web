<!-- A square showing a theme's base colour; auto is cut in two, light over dark. -->
<script setup lang="ts">
import { EnumTheme } from '@chapelure/ui/settings/useSettings';

defineProps<{ theme: EnumTheme }>();
</script>

<template>
    <!-- The `.light` / `.dark` class scopes that theme's palette to the span it is on. -->
    <span class="relative size-5 overflow-hidden rounded border">
        <template v-if="theme === EnumTheme.auto">
            <span class="light absolute inset-0 bg-background"></span>
            <span class="dark absolute inset-0 bg-background"
                style="clip-path: polygon(100% 0, 100% 100%, 0 100%)"></span>
        </template>
        <span v-else
            :class="theme === EnumTheme.dark ? 'dark' : 'light'"
            class="absolute inset-0 bg-background"></span>
    </span>
</template>
