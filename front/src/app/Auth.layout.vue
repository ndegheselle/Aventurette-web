<script setup lang="ts">
import AlertsContainer from '@chapelure/ui/alerts/AlertsContainer.vue';
import ConfirmationModal from '@chapelure/ui/modals/ConfirmationModal.vue';
import SettingsMenu from '@chapelure/ui/settings/SettingsMenu.vue';
import { HouseIcon } from 'lucide-vue-next';
</script>

<template>
    <div class="flex flex-col min-h-dvh">
        <nav class="navbar bg-base-300 min-h-0 p-1">
            <RouterLink to="/" class="btn btn-square btn-ghost" :aria-label="$t('home')">
                <HouseIcon />
            </RouterLink>

            <div class="ms-auto">
                <ul>
                    <SettingsMenu />
                </ul>
            </div>
        </nav>

        <main class="flex flex-1 overflow-x-clip relative">
            <RouterView />
        </main>
        <footer class="footer sm:footer-horizontal footer-center bg-base-300 text-base-content p-4">
            <aside>
                <p>
                    Copyright © {{ new Date().getFullYear() }} - aventurette
                </p>
            </aside>
        </footer>
    </div>

    <ConfirmationModal />
    <AlertsContainer />
</template>
