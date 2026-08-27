<script setup lang="ts">
import Panel from '@chapelure/ui/layout/Panel.vue';

// XXX : WIP — still to add here: change email address, change password, show account type.
</script>

<template>
    <Panel>
        <div class="flex items-center gap-4">
            <div class="skeleton h-16 w-16 shrink-0 rounded-full"></div>
            <div class="flex flex-col gap-4">
                <div class="skeleton h-4 w-20"></div>
                <div class="skeleton h-4 w-28"></div>
            </div>
        </div>
    </Panel>
</template>
