<script setup lang="ts">
import { useIsMobile } from '@chapelure/ui/layout/useIsMobile';
import { useActivity } from '@features/activities/composables/useActivity';
import { routesNames as activitiesRoutesNames } from '@features/activities/routes';
import ActivityActions from '@features/activities/ui/activity/_parts/actions.vue';
import ActivityAttributes from '@features/activities/ui/activity/_parts/attributes.vue';
import DesktopLayout from '@features/activities/ui/activity/desktop.layout.vue';
import ActivityDetails from '@features/activities/ui/activity/_parts/details.vue';
import ActivitySafety from '@features/activities/ui/activity/_parts/safety.vue';
import MobileLayout from '@features/activities/ui/activity/mobile.layout.vue';
import { ArrowLeftIcon } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

const router = useRouter();
const { activity, resources, timing, ageLabel, participantsLabel } = useActivity();
const { isMobile } = useIsMobile();

// Opened from a link straight to the page, there is no previous page: fall back to the library.
function back() {
    if (router.options.history.state.back) router.back();
    else router.push({ name: activitiesRoutesNames.library });
}
</script>

<!-- The content is written once here; each layout only decides where its slots go. -->
<template>
    <component v-if="activity" :is="isMobile ? MobileLayout : DesktopLayout">
        <template #back>
            <button type="button" class="btn btn-soft btn-square btn-lg" :aria-label="$t('back')" @click="back">
                <ArrowLeftIcon />
            </button>
        </template>

        <template #safety>
            <ActivitySafety :activity="activity" />
        </template>

        <template #actions>
            <ActivityActions :activity="activity" />
        </template>

        <template #image>
            <img src="https://placeholder.pagebee.io/api/plain/800/800" alt="" class="w-full h-90 object-cover" />
        </template>

        <template #header>
            <h1 class="text-2xl md:text-3xl lg:text-4xl font-bold">{{ activity.name }}</h1>
            <span class="text-sm" v-html="activity.description"></span>
        </template>

        <template #attributes>
            <ActivityAttributes :activity="activity" :timing="timing" :age-label="ageLabel"
                                :participants-label="participantsLabel" />
        </template>

        <template #details>
            <ActivityDetails :activity="activity" :resources="resources" />
        </template>
    </component>

    <div v-else class="flex justify-center p-8">
        <span class="loading loading-spinner"></span>
    </div>
</template>
