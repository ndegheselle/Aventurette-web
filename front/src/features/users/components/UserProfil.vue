<script setup lang="ts">
import Panel from '@chapelure/ui/layout/Panel.vue';
import Skeleton from '@chapelure/ui/primitives/Skeleton.vue';

// XXX : WIP — still to add here: change email address, change password, show account type.
</script>

<template>
    <Panel>
        <div class="flex items-center gap-4">
            <Skeleton class="h-16 w-16 shrink-0 rounded-full" />
            <div class="flex flex-col gap-4">
                <Skeleton class="h-4 w-20" />
                <Skeleton class="h-4 w-28" />
            </div>
        </div>
    </Panel>
</template>
