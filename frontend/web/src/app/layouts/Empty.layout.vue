<script setup lang="ts">
import AlertsContainer from '@chapelure/ui/alerts/AlertsContainer.vue';
import ConfirmationModal from '@chapelure/ui/modals/ConfirmationModal.vue';
</script>

<template>
    <main class="flex min-h-dvh flex-1 overflow-x-clip relative">
        <RouterView />
    </main>

    <ConfirmationModal />
    <AlertsContainer />
</template>
