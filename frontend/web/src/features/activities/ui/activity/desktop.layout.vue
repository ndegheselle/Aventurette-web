<!-- The activity page on a desktop: a sticky top bar with the back button and the actions, then
     the image and attributes in a sticky column beside the rest. Stacked below `lg`, where the two
     columns do not fit beside the sidebar. -->
<script setup lang="ts">
import Container from '@chapelure/ui/layout/Container.vue';
</script>

<template>
    <Container>
        <div class="sticky top-0 z-10 flex items-center justify-between p-4 bg-base-100">
            <slot name="back"></slot>
            <slot name="actions"></slot>
        </div>

        <div class="flex flex-col gap-6 px-4 pb-4 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start">
            <!-- `top-24` clears the top bar. -->
            <div class="flex flex-col gap-2 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto">
                <div class="rounded-box overflow-hidden">
                    <slot name="image"></slot>
                </div>
                <slot name="attributes"></slot>
            </div>

            <div class="flex flex-col gap-2">
                <div class="mb-4">
                    <slot name="header"></slot>
                </div>
                <slot name="details"></slot>
            </div>
        </div>
    </Container>
</template>
