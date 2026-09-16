<script setup lang="ts">
import { MenuIcon, PencilLineIcon, TreesIcon } from 'lucide-vue-next';
import AlertsContainer from '@chapelure/ui/alerts/AlertsContainer.vue';
import Dropdown from '@chapelure/ui/dropdown/Dropdown.vue';
import DropdownTrigger from '@chapelure/ui/dropdown/DropdownTrigger.vue';
import ConfirmationModal from '@chapelure/ui/modals/ConfirmationModal.vue';
import SettingsMenu from '@chapelure/ui/settings/SettingsMenu.vue';
import { routesNames as activitiesRoutesNames } from '@features/activities/routes';
import { routesNames as activitiesEditRoutesNames } from '@features/activities-authoring/routes';
import AuthMenu from '@features/users/components/navbar/AuthMenu.vue';
</script>

<template>
    <div class="min-h-screen flex flex-col">
        <nav class="navbar bg-base-300 shadow-sm">
            <div class="flex flex-1">
                <Dropdown class="md:hidden">
                    <template #summary>
                        <DropdownTrigger>
                            <MenuIcon />
                        </DropdownTrigger>
                    </template>
                    <ul class="menu p-2">
                        <li>
                            <RouterLink :to="{ name: activitiesRoutesNames.all }">
                                <TreesIcon /> {{ $t('activities.title') }}
                            </RouterLink>
                        </li>
                        <li>
                            <RouterLink :to="{ name: activitiesEditRoutesNames.all }">
                                <PencilLineIcon /> {{ $t('activities.edit.title') }}
                            </RouterLink>
                        </li>
                    </ul>
                </Dropdown>

                <RouterLink to="/" class="flex">
                    <img class="my-auto" src="https://placeholder.pagebee.io/api/plain/32/32" style="height: 32px;" />
                    <span class="ms-2 my-auto text-xl hidden md:block">Aventurette</span>
                </RouterLink>
            </div>

            <div class="navbar-center hidden md:flex">
                <ul class="menu menu-horizontal px-1">
                    <li>
                        <RouterLink :to="{ name: activitiesRoutesNames.all }">
                            <TreesIcon /> {{ $t('activities.title') }}
                        </RouterLink>
                    </li>
                    <li>
                        <RouterLink :to="{ name: activitiesEditRoutesNames.all }">
                            <PencilLineIcon /> {{ $t('activities.edit.title') }}
                        </RouterLink>
                    </li>
                </ul>
            </div>

            <div class="navbar-end">
                <ul>
                    <SettingsMenu />
                    <AuthMenu />
                </ul>
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
                    Copyright © {{ new Date().getFullYear() }} - aventurette
                </p>
            </aside>
        </footer>

        <ConfirmationModal />
        <AlertsContainer />
    </div>
</template>
