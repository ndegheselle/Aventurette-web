<script setup lang="ts">
import SettingsMenu from '@chapelure/common/components/navbar/SettingsMenu.vue';
import AlertsContainer from '@chapelure/common/components/popups/AlertsContainer.vue';
import ConfirmationModal from '@chapelure/common/components/popups/ConfirmationModal.vue';
import UserSideMenu from '@features/users/components/navbar/UserSideMenu.vue';
import { MenuIcon, TreesIcon } from 'lucide-vue-next';
import { routesNames as activitiesRoutesNames } from '@features/activities/routes';
</script>

<template>
    <div class="min-h-screen flex flex-col">
        <nav class="navbar bg-base-300 shadow-sm">
            <div class="flex flex-1">
                <details class="dropdown">
                    <summary class="btn btn-ghost btn-square">
                        <MenuIcon />
                    </summary>
                    <ul class="menu dropdown-content bg-base-200 rounded-box w-52 p-2 shadow">
                        <li>
                            <RouterLink :to="{ name: activitiesRoutesNames.all }">
                                <TreesIcon /> {{ $t('activities.title') }}
                            </RouterLink>
                        </li>
                        <UserSideMenu />
                    </ul>
                </details>

                <img class="ms-1 my-auto" src="https://placeholder.pagebee.io/api/plain/32/32" style="height: 32px;" />
                <RouterLink to="/" class="ms-2 my-auto text-xl">Aventurette</RouterLink>
            </div>

            <div class="flex">
                <SettingsMenu />
            </div>
        </nav>

        <main class="flex flex-1 overflow-x-clip relative">
            <router-view v-slot="{ Component, route }">
                <transition v-if="route.meta.transition" :name="route.meta.transition">
                    <component :is="Component" />
                </transition>
                <component v-else :is="Component" />
            </router-view>
        </main>

        <footer class="footer sm:footer-horizontal footer-center bg-base-300 text-base-content p-4">
            <aside>
                <p>
                    Copyright © {{ new Date().getFullYear() }} - bigarrer
                </p>
            </aside>
        </footer>

        <ConfirmationModal />
        <AlertsContainer />
    </div>
</template>