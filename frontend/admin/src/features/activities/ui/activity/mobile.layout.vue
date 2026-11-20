<!-- The activity page on a phone: one column, the back button floating top-left and the
     safety one top-right, the actions sticking above the dock. -->
<script setup lang="ts">
import Container from '@chapelure/ui/layout/Container.vue';
</script>

<template>
    <Container>
        <div class="fixed z-10 m-4">
            <slot name="back"></slot>
        </div>
        <div class="fixed right-0 z-10 m-4">
            <slot name="safety"></slot>
        </div>

        <slot name="image"></slot>
        <div class="text-center my-8">
            <slot name="header"></slot>
        </div>

        <div class="mx-2 flex flex-col gap-2">
            <slot name="attributes"></slot>
            <slot name="details"></slot>
        </div>

        <div class="sticky bottom-14 flex justify-center p-2">
            <slot name="actions"></slot>
        </div>
    </Container>
</template>
