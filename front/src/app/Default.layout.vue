<script setup lang="ts">
import AlertsContainer from '@chapelure/ui/alerts/AlertsContainer.vue';
import ConfirmationModal from '@chapelure/ui/modals/ConfirmationModal.vue';
import SettingsMenu from '@chapelure/ui/settings/SettingsMenu.vue';
import { routesNames as activitiesEditRoutesNames } from '@features/activities-authoring/routes';
import { routesNames as activitiesRoutesNames } from '@features/activities/routes';
import { PanelLeftOpen, PencilLineIcon, TreesIcon } from 'lucide-vue-next';

import AuthMenu from '@features/users/components/navbar/AuthMenu.vue';
</script>

<template>
    <div class="min-h-screen flex flex-col">
        <div class="drawer lg:drawer-open">
            <input id="side-menu-drawer"
                   type="checkbox"
                   class="drawer-toggle inline" />
            <div class="drawer-content">
                <!-- Navbar -->
                <nav class="navbar bg-base-300">
                    <label for="side-menu-drawer"
                           aria-label="open sidebar"
                           class="btn btn-square btn-ghost drawer-button">
                        <PanelLeftOpen />
                    </label>

                    <div class="ms-auto">
                        <ul>
                            <SettingsMenu />
                            <AuthMenu />
                        </ul>
                    </div>
                </nav>

                <!-- Page content here -->
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
            </div>

            <div class="drawer-side is-drawer-close:overflow-visible">
                <label for="side-menu-drawer"
                       aria-label="close sidebar"
                       class="drawer-overlay"></label>
                <div class="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:w-14 is-drawer-open:w-64">
                    <RouterLink to="/"
                                class="flex mx-auto mt-4 mb-2">
                        <img class="my-auto"
                             src="https://placeholder.pagebee.io/api/plain/32/32"
                             style="height: 32px;" />
                        <span class="my-auto ms-2 is-drawer-close:hidden">Aventurette</span>
                    </RouterLink>
                    <!-- Sidebar content here -->
                    <ul class="menu w-full grow">
                        <li>
                            <RouterLink class="is-drawer-close:tooltip is-drawer-close:tooltip-right"
                                        :to="{ name: activitiesRoutesNames.all }"
                                        :data-tip="$t('activities.title')">
                                <TreesIcon />
                                <span class="is-drawer-close:hidden">{{ $t('activities.title') }}</span>
                            </RouterLink>
                        </li>
                        <div class="divider is-drawer-open:hidden m-0"></div>
                        <li class="menu-title is-drawer-close:hidden">{{ $t('admin.title') }}</li>
                        <li>
                            <RouterLink class="is-drawer-close:tooltip is-drawer-close:tooltip-right"
                                        :to="{ name: activitiesEditRoutesNames.all }"
                                        :data-tip="$t('activities.authoring.title')">
                                <PencilLineIcon />
                                <span class="is-drawer-close:hidden">{{ $t('activities.authoring.title') }}</span>
                            </RouterLink>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

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
