<script setup lang="ts">
import AlertsContainer from '@common/components/popups/AlertsContainer.vue';
import ConfirmationModal from '@common/components/popups/ConfirmationModal.vue';
import UserMenu from '@features/users/navbar/UserMenu.vue';

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
                    <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
                        <i class="fa-solid fa-bars-staggered"></i>
                    </div>
                    <ul tabindex="-1"
                        class="menu menu-sm dropdown-content bg-base-200 rounded-box z-1 mt-3 w-52 p-2 shadow">
                        
                    </ul>
                </div>

                <RouterLink to="/" class="text-xl">Aventurette</RouterLink>
            </div>
            <div class="navbar-center hidden lg:flex">
                <ul class="menu menu-horizontal px-1">
                </ul>
            </div>

            <div class="navbar-end">
                <button class="btn btn-ghost btn-circle avatar me-1">
                    <label class="swap swap-rotate">
                        <input type="checkbox" class="theme-controller" :checked="isDark" value="corporate"
                            @change="() => toggleTheme(!isDark)" />
                        <i class="swap-on fa-solid fa-sun"></i>
                        <i class="swap-off fa-solid fa-moon"></i>
                    </label>
                </button>
                <UserMenu />
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