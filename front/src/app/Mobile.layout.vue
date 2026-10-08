<script setup lang="ts">
import AlertsContainer from '@chapelure/ui/alerts/AlertsContainer.vue';
import { useNavbar } from '@chapelure/ui/layout/useNavbar';
import ConfirmationModal from '@chapelure/ui/modals/ConfirmationModal.vue';
import SettingsMenu from '@chapelure/ui/settings/SettingsMenu.vue';
import { routesNames as activitiesRoutesNames } from '@features/activities/routes';
import AuthMenu from '@features/auth/components/AuthMenu.vue';
import { ArrowLeftIcon, LibraryIcon, LightbulbIcon, SearchIcon } from 'lucide-vue-next';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const { title } = useNavbar();
const route = useRoute();
const router = useRouter();

// The dock's home: nothing to go back to from there.
const canGoBack = computed(() => route.name !== activitiesRoutesNames.all);

function goBack() {
    // Opened from a shared link, there is no history to pop: land on the Ludotech instead.
    if (window.history.state?.back) {
        router.back();
    } else {
        router.push({ name: activitiesRoutesNames.all });
    }
}
</script>

<template>
    <div class="flex flex-col min-h-dvh">
        <nav class="navbar bg-base-300 min-h-0 p-1 sticky top-0 z-10">
            <div class="w-12">
                <button v-if="canGoBack" type="button" class="btn btn-square btn-ghost"
                    :aria-label="$t('back')" @click="goBack">
                    <ArrowLeftIcon />
                </button>
            </div>
            <span class="flex-1 text-center text-lg truncate">{{ title }}</span>
            <ul class="flex">
                <SettingsMenu />
                <AuthMenu />
            </ul>
        </nav>

        <!-- The dock is fixed: leave it room so the last content is not hidden behind it. -->
        <main class="flex flex-1 overflow-x-clip relative pb-16">
            <RouterView />
        </main>

        <div class="dock dock-sm bg-base-300">
            <RouterLink :to="{ name: activitiesRoutesNames.all }" active-class="dock-active">
                <LibraryIcon />
                <span class="dock-label">{{ $t('dock.ludotech') }}</span>
            </RouterLink>
            <!-- XXX : no search or tips page for the public yet. -->
            <button type="button" disabled>
                <SearchIcon />
                <span class="dock-label">{{ $t('dock.search') }}</span>
            </button>
            <button type="button" disabled>
                <LightbulbIcon />
                <span class="dock-label">{{ $t('dock.tips') }}</span>
            </button>
        </div>
    </div>

    <ConfirmationModal />
    <AlertsContainer />
</template>
