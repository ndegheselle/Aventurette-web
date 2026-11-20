<!-- A square showing a theme's base colour; auto is cut in two, light over dark. -->
<script setup lang="ts">
import { EnumTheme } from '@chapelure/ui/settings/useSettings';

defineProps<{ theme: EnumTheme }>();
</script>

<template>
    <span class="size-5 rounded border border-base-content/20 overflow-hidden relative">
        <template v-if="theme === EnumTheme.auto">
            <span data-theme="light"
                class="absolute inset-0 bg-base-100"></span>
            <span data-theme="dark"
                class="absolute inset-0 bg-base-100"
                style="clip-path: polygon(100% 0, 100% 100%, 0 100%)"></span>
        </template>
        <span v-else
            :data-theme="theme === EnumTheme.dark ? 'dark' : 'light'"
            class="absolute inset-0 bg-base-100"></span>
    </span>
</template>
