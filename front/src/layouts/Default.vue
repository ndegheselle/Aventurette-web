<script setup lang="ts">
import SettingsMenu from '@common/components/navbar/SettingsMenu.vue';
import AlertsContainer from '@common/components/popups/AlertsContainer.vue';
import ConfirmationModal from '@common/components/popups/ConfirmationModal.vue';
import UserMenu from '@features/users/components/navbar/UserMenu.vue';
import { LanguagesIcon, MenuIcon, SunMoonIcon } from 'lucide-vue-next';

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
                    <div tabindex="0" role="button" class="btn btn-ghost btn-square lg:hidden">
                        <MenuIcon />
                    </div>
                    <ul tabindex="-1"
                        class="menu menu-sm dropdown-content bg-base-200 rounded-box z-1 mt-3 w-52 p-2 shadow">
                    </ul>
                </div>

                <img class="ms-1" src="/icon.svg" style="height: 32px;" />
                <RouterLink to="/" class="ms-2 text-xl">Aventurette</RouterLink>
            </div>

            <div class="navbar-end">
                <SettingsMenu />
                <UserMenu class="ms-1" />
            </div>
        </nav>

        <main class="flex flex-1">
            <RouterView />
        </main>

        <footer class="footer sm:footer-horizontal footer-center bg-base-300 text-base-content p-4 mt-auto">
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