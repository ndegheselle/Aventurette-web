<script setup lang="ts">
import AlertsContainer from '@chapelure/ui/alerts/AlertsContainer.vue';
import ConfirmationModal from '@chapelure/ui/modals/ConfirmationModal.vue';
import { routesNames as activitiesRoutesNames } from '@features/activities/routes';
import { routesNames as planningRoutesNames } from '@features/planning/routes';
import { FolderHeartIcon, LightbulbIcon, SearchIcon, UserIcon } from 'lucide-vue-next';
import { routesNames as usersRoutesNames } from '@features/user/routes';

</script>

<template>
    <div class="flex min-h-dvh flex-col">
        <!-- The dock is fixed: leave it room so the last content is not hidden behind it. -->
        <main class="relative flex flex-1 overflow-x-clip pb-14">
            <RouterView />
        </main>

        <nav class="fixed inset-x-0 bottom-0 z-40 flex h-14 border-t bg-background pb-[env(safe-area-inset-bottom)] [&>*]:flex [&>*]:flex-1 [&>*]:flex-col [&>*]:items-center [&>*]:justify-center [&>*]:gap-0.5 [&>*]:text-muted-foreground [&>*:disabled]:opacity-50">
            <RouterLink :to="{ name: planningRoutesNames.planning }" active-class="text-foreground!">
                <FolderHeartIcon />
                <span class="text-xs">{{ $t('dock.space') }}</span>
            </RouterLink>
            <RouterLink :to="{ name: activitiesRoutesNames.library }" active-class="text-foreground!">
                <SearchIcon />
                <span class="text-xs">{{ $t('dock.search') }}</span>
            </RouterLink>
            <!-- XXX : no tips page for the public yet. -->
            <button type="button" disabled>
                <LightbulbIcon />
                <span class="text-xs">{{ $t('dock.tips') }}</span>
            </button>
            <RouterLink :to="{ name: usersRoutesNames.settings }" active-class="text-foreground!">
                <UserIcon />
                <span class="text-xs">{{ $t('dock.profil') }}</span>
            </RouterLink>
        </nav>
    </div>

    <ConfirmationModal />
    <AlertsContainer />
</template>
