<script setup lang="ts">
import AlertsContainer from '@chapelure/ui/alerts/AlertsContainer.vue';
import ConfirmationModal from '@chapelure/ui/modals/ConfirmationModal.vue';
import { routesNames as activitiesRoutesNames } from '@features/activities/routes';
import { routesNames as planningRoutesNames } from '@features/planning/routes';
import { CalendarIcon, LibraryIcon, LightbulbIcon, UserIcon } from 'lucide-vue-next';
import { routesNames as usersRoutesNames } from '@features/user/routes';

</script>

<template>
    <div class="flex flex-col min-h-dvh">
        <!-- The dock is fixed: leave it room so the last content is not hidden behind it. -->
        <main class="flex flex-1 overflow-x-clip relative pb-14">
            <RouterView />
        </main>

        <div class="dock dock-sm bg-base-300">
            <RouterLink :to="{ name: activitiesRoutesNames.library }" active-class="dock-active">
                <LibraryIcon />
                <span class="dock-label">{{ $t('dock.library') }}</span>
            </RouterLink>
            <RouterLink :to="{ name: planningRoutesNames.planning }" active-class="dock-active">
                <CalendarIcon />
                <span class="dock-label">{{ $t('dock.planning') }}</span>
            </RouterLink>
            <!-- XXX : no tips page for the public yet. -->
            <button type="button" disabled>
                <LightbulbIcon />
                <span class="dock-label">{{ $t('dock.tips') }}</span>
            </button>
            <RouterLink :to="{ name: usersRoutesNames.settings }">
                <UserIcon />
                <span class="dock-label">{{ $t('dock.profil') }}</span>
            </RouterLink>
        </div>
    </div>

    <ConfirmationModal />
    <AlertsContainer />
</template>
