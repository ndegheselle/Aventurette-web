<script setup lang="ts">
import AlertsContainer from '@chapelure/ui/alerts/AlertsContainer.vue';
import { useNavbar } from '@chapelure/ui/layout/useNavbar';
import ConfirmationModal from '@chapelure/ui/modals/ConfirmationModal.vue';
import { routesNames as activitiesRoutesNames } from '@features/activities/routes';
import { routesNames as authoringRoutesNames } from '@features/admin/activities-authoring/routes';
import { routesNames as catalogueRoutesNames } from '@features/admin/catalogue-authoring/routes';
import { useAuth } from '@features/user/composables/useAuth';
import { Role } from '@features/user/models/user';
import { routesNames as usersRoutesNames } from '@features/user/routes';
import {
    LibraryBigIcon,
    LibraryIcon,
    LightbulbIcon,
    PanelLeftCloseIcon,
    PanelLeftOpenIcon,
    PencilLineIcon,
    SearchIcon,
} from 'lucide-vue-next';
import { ref } from 'vue';

// The sidebar is always shown; the toggle only widens it to show the labels.
const isDrawerOpen = ref(false);
const { title } = useNavbar();
const { hasRole } = useAuth();
</script>

<template>
    <div class="drawer drawer-open min-h-dvh">
        <input id="side-menu-drawer" type="checkbox" class="drawer-toggle" v-model="isDrawerOpen" />
        <div class="drawer-content flex flex-col">
            <nav class="navbar bg-base-300 min-h-0 p-1">
                <label for="side-menu-drawer" :aria-label="$t(isDrawerOpen ? 'sidebar.close' : 'sidebar.open')"
                    class="btn btn-square btn-ghost drawer-button">
                    <PanelLeftCloseIcon v-if="isDrawerOpen" />
                    <PanelLeftOpenIcon v-else />
                </label>
                <span v-if="title" class="ms-2 text-lg truncate">{{ title }}</span>

                <div class="ms-auto flex gap-1">
                    <RouterLink class="btn btn-circle btn-ghost" :to="{ name: usersRoutesNames.settings }">
                        <div class="avatar">
                            <div class="rounded-full">
                                <img alt="" src="https://placeholder.pagebee.io/api/plain/32/32" />
                            </div>
                        </div>
                    </RouterLink>
                </div>
            </nav>

            <main class="flex flex-1 overflow-x-clip relative">
                <RouterView />
            </main>
        </div>

        <div class="drawer-side is-drawer-close:overflow-visible">
            <label for="side-menu-drawer" :aria-label="$t('sidebar.close')" class="drawer-overlay"></label>
            <div class="min-h-full flex flex-col items-start bg-base-200 is-drawer-close:w-14 is-drawer-open:w-64">
                <RouterLink :to="{ name: activitiesRoutesNames.library }" class="flex my-2 mx-3">
                    <img class="my-auto" src="https://placeholder.pagebee.io/api/plain/32/32" alt=""
                        style="height: 32px;" />
                    <span class="my-auto ms-2 is-drawer-close:hidden">Aventurette</span>
                </RouterLink>
                <ul class="menu w-full">
                    <li>
                        <RouterLink class="p-3 is-drawer-close:tooltip is-drawer-close:tooltip-right"
                            :to="{ name: activitiesRoutesNames.library }" active-class="menu-active"
                            :data-tip="$t('dock.library')">
                            <LibraryIcon />
                            <span class="is-drawer-close:hidden">{{ $t('dock.library') }}</span>
                        </RouterLink>
                    </li>
                    <li>
                        <RouterLink class="p-3 is-drawer-close:tooltip is-drawer-close:tooltip-right"
                            :to="{ name: activitiesRoutesNames.search }" active-class="menu-active"
                            :data-tip="$t('dock.search')">
                            <SearchIcon />
                            <span class="is-drawer-close:hidden">{{ $t('dock.search') }}</span>
                        </RouterLink>
                    </li>
                    <li class="menu-disabled">
                        <span class="p-3 is-drawer-close:tooltip is-drawer-close:tooltip-right"
                            :data-tip="$t('dock.tips')">
                            <LightbulbIcon />
                            <span class="is-drawer-close:hidden">{{ $t('dock.tips') }}</span>
                        </span>
                    </li>
                    <!-- Authoring is desktop-only: the mobile dock has no counterpart. -->
                    <template v-if="hasRole(Role.ADMIN)">
                        <div class="divider is-drawer-open:hidden m-0"></div>
                        <li class="menu-title is-drawer-close:hidden">{{ $t('admin.title') }}</li>
                        <li>
                            <RouterLink class="p-3 is-drawer-close:tooltip is-drawer-close:tooltip-right"
                                :to="{ name: authoringRoutesNames.all }" active-class="menu-active"
                                :data-tip="$t('activities.authoring.title')">
                                <PencilLineIcon />
                                <span class="is-drawer-close:hidden">{{ $t('activities.authoring.title') }}</span>
                            </RouterLink>
                        </li>
                        <li>
                            <RouterLink class="p-3 is-drawer-close:tooltip is-drawer-close:tooltip-right"
                                :to="{ name: catalogueRoutesNames.materials }" active-class="menu-active"
                                :data-tip="$t('catalogue.title')">
                                <LibraryBigIcon />
                                <span class="is-drawer-close:hidden">{{ $t('catalogue.title') }}</span>
                            </RouterLink>
                        </li>
                    </template>
                </ul>
            </div>
        </div>
    </div>

    <ConfirmationModal />
    <AlertsContainer />
</template>
