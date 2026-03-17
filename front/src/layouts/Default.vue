<script setup lang="ts">
import SettingsMenu from '@common/components/navbar/SettingsMenu.vue';
import AlertsContainer from '@common/components/popups/AlertsContainer.vue';
import ConfirmationModal from '@common/components/popups/ConfirmationModal.vue';
import UserMenu from '@features/users/components/navbar/UserMenu.vue';
import { MenuIcon } from 'lucide-vue-next';

let isDark = JSON.parse(localStorage.getItem('isdark') ?? 'false');
function toggleTheme(dark: boolean) {
    localStorage.setItem('isdark', JSON.stringify(dark));
    isDark = dark;
}
</script>

<template>
    <div class="min-h-screen flex flex-col">
        <nav class="navbar bg-base-300 shadow-sm">
            <div class="navbar-start">
                <div class="dropdown">
                    <div tabindex="0"
                         role="button"
                         class="btn btn-ghost btn-square lg:hidden">
                        <MenuIcon />
                    </div>
                    <ul tabindex="-1"
                        class="menu menu-sm dropdown-content bg-base-200 rounded-box z-1 mt-3 w-52 p-2 shadow">
                    </ul>
                </div>

                <img class="ms-1"
                     src="https://placeholder.pagebee.io/api/plain/32/32"
                     style="height: 32px;" />
                <RouterLink to="/"
                            class="ms-2 text-xl">Aventurette</RouterLink>
            </div>

            <div class="navbar-end">
                <SettingsMenu />
                <UserMenu class="ms-1" />
            </div>
        </nav>

        <main class="flex flex-1 overflow-x-hidden relative">
            <router-view v-slot="{ Component, route }">
                <transition v-if="route.meta.transition"
                            :name="route.meta.transition">
                    <component :is="Component" />
                </transition>
                <component v-else
                           :is="Component" />
            </router-view>
        </main>

        <footer class="footer sm:footer-horizontal footer-center bg-base-300 text-base-content p-4">
            <aside>
                <p>
                    Copyright © {{ new Date().getFullYear() }} - Aventurette
                </p>
            </aside>
        </footer>

        <ConfirmationModal />
        <AlertsContainer />
    </div>
</template>