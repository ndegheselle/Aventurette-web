<script setup lang="ts">
import { MenuIcon, TreesIcon } from 'lucide-vue-next';
import Footer from '@chapelure/ui/layout/Footer.vue';
import Navbar from '@chapelure/ui/layout/Navbar.vue';
import Menu from '@chapelure/ui/navigation/Menu.vue';
import AlertsContainer from '@chapelure/ui/overlays/AlertsContainer.vue';
import ConfirmationModal from '@chapelure/ui/overlays/ConfirmationModal.vue';
import Dropdown from '@chapelure/ui/overlays/Dropdown.vue';
import DropdownTrigger from '@chapelure/ui/overlays/DropdownTrigger.vue';
import SettingsMenu from '@chapelure/ui/settings/SettingsMenu.vue';
import { routesNames as activitiesRoutesNames } from '@features/activities/routes';
import UserSideMenu from '@features/users/components/navbar/UserSideMenu.vue';
</script>

<template>
    <div class="min-h-screen flex flex-col">
        <Navbar>
            <div class="flex flex-1">
                <Dropdown>
                    <template #summary>
                        <DropdownTrigger>
                            <MenuIcon />
                        </DropdownTrigger>
                    </template>
                    <Menu class="p-2">
                        <li>
                            <RouterLink :to="{ name: activitiesRoutesNames.all }">
                                <TreesIcon /> {{ $t('activities.title') }}
                            </RouterLink>
                        </li>
                        <UserSideMenu />
                    </Menu>
                </Dropdown>

                <img class="ms-1 my-auto"
                     src="https://placeholder.pagebee.io/api/plain/32/32"
                     style="height: 32px;" />
                <RouterLink to="/"
                            class="ms-2 my-auto text-xl">Aventurette</RouterLink>
            </div>

            <div class="flex">
                <SettingsMenu />
            </div>
        </Navbar>

        <main class="flex flex-1 overflow-x-clip relative">
            <router-view v-slot="{ Component, route }">
                <transition v-if="route.meta.transition"
                            :name="route.meta.transition">
                    <component :is="Component" />
                </transition>
                <component v-else
                           :is="Component" />
            </router-view>
        </main>

        <Footer>
            <aside>
                <p>
                    Copyright © {{ new Date().getFullYear() }} - bigarrer
                </p>
            </aside>
        </Footer>

        <ConfirmationModal />
        <AlertsContainer />
    </div>
</template>
