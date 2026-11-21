<script setup lang="ts">
import AlertsContainer from '@chapelure/ui/alerts/AlertsContainer.vue';
import { useNavbar } from '@chapelure/ui/layout/useNavbar';
import ConfirmationModal from '@chapelure/ui/modals/ConfirmationModal.vue';
import { Avatar, AvatarFallback, AvatarImage } from '@chapelure/ui/shadcn/avatar';
import { Button } from '@chapelure/ui/shadcn/button';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
} from '@chapelure/ui/shadcn/sidebar';
import { routesNames as activitiesRoutesNames } from '@features/activities/routes';
import { routesNames as authoringRoutesNames } from '@features/admin/activities-authoring/routes';
import { routesNames as catalogueRoutesNames } from '@features/admin/catalogue-authoring/routes';
import { routesNames as planningRoutesNames } from '@features/planning/routes';
import { useAuth } from '@features/user/composables/useAuth';
import { Role } from '@features/user/models/user';
import { routesNames as usersRoutesNames } from '@features/user/routes';
import {
    FolderHeartIcon,
    LibraryBigIcon,
    LightbulbIcon,
    PanelLeftCloseIcon,
    PanelLeftOpenIcon,
    PencilLineIcon,
    SearchIcon,
    UserIcon,
} from 'lucide-vue-next';
import { ref } from 'vue';

// The sidebar is always shown, as icons; the toggle only widens it to show the labels.
const isDrawerOpen = ref(false);
const { title } = useNavbar();
const { hasRole } = useAuth();

/** A link's look while its route is the current one, as shadcn marks an active menu button. */
const activeClass = 'bg-sidebar-accent font-medium text-sidebar-accent-foreground';
</script>

<template>
    <SidebarProvider v-model:open="isDrawerOpen">
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" as-child>
                            <RouterLink :to="{ name: activitiesRoutesNames.library }">
                                <img class="size-8 rounded-md" src="https://placeholder.pagebee.io/api/plain/32/32" alt="" />
                                <span class="font-semibold">Aventurette</span>
                            </RouterLink>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton as-child :tooltip="$t('dock.search')">
                                <RouterLink :to="{ name: activitiesRoutesNames.library }" :active-class="activeClass">
                                    <SearchIcon />
                                    <span>{{ $t('dock.search') }}</span>
                                </RouterLink>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <!-- The planning is the space's first tab: the link stays active on the others. -->
                        <SidebarMenuItem>
                            <SidebarMenuButton as-child :tooltip="$t('dock.space')">
                                <RouterLink :to="{ name: planningRoutesNames.planning }" :active-class="activeClass">
                                    <FolderHeartIcon />
                                    <span>{{ $t('dock.space') }}</span>
                                </RouterLink>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton disabled :tooltip="$t('dock.tips')">
                                <LightbulbIcon />
                                <span>{{ $t('dock.tips') }}</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
                <!-- Authoring is desktop-only: the mobile dock has no counterpart. -->
                <SidebarGroup v-if="hasRole(Role.ADMIN)">
                    <SidebarGroupLabel>{{ $t('admin.title') }}</SidebarGroupLabel>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton as-child :tooltip="$t('activities.authoring.title')">
                                <RouterLink :to="{ name: authoringRoutesNames.all }" :active-class="activeClass">
                                    <PencilLineIcon />
                                    <span>{{ $t('activities.authoring.title') }}</span>
                                </RouterLink>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton as-child :tooltip="$t('catalogue.title')">
                                <RouterLink :to="{ name: catalogueRoutesNames.materials }" :active-class="activeClass">
                                    <LibraryBigIcon />
                                    <span>{{ $t('catalogue.title') }}</span>
                                </RouterLink>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>

        <SidebarInset class="min-w-0">
            <header class="flex h-12 shrink-0 items-center gap-2 border-b px-2">
                <Button variant="ghost" size="icon"
                        :aria-label="$t(isDrawerOpen ? 'sidebar.close' : 'sidebar.open')"
                        @click="isDrawerOpen = !isDrawerOpen">
                    <PanelLeftCloseIcon v-if="isDrawerOpen" />
                    <PanelLeftOpenIcon v-else />
                </Button>
                <span v-if="title" class="truncate text-lg font-medium">{{ title }}</span>

                <div class="ms-auto flex gap-1">
                    <Button variant="ghost" size="icon" class="rounded-full" as-child>
                        <RouterLink :to="{ name: usersRoutesNames.settings }">
                            <Avatar class="size-8">
                                <AvatarImage src="https://placeholder.pagebee.io/api/plain/32/32" alt="" />
                                <AvatarFallback><UserIcon /></AvatarFallback>
                            </Avatar>
                        </RouterLink>
                    </Button>
                </div>
            </header>

            <main class="relative flex flex-1 overflow-x-clip">
                <RouterView />
            </main>
        </SidebarInset>
    </SidebarProvider>

    <ConfirmationModal />
    <AlertsContainer />
</template>
