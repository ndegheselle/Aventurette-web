<!-- The settings' profile section: the filter defaults. A page of its own on a phone, beside the menu on a desktop. -->
<script setup lang="ts">
import { useAlert } from '@chapelure/ui/alerts/useAlert';
import { useIsMobile } from '@chapelure/ui/layout/useIsMobile';
import { useFilterDefaults } from '@features/user/composables/useFilterDefaults';
import { routesNames } from '@features/user/routes';
import FilterDefaults from '@features/user/ui/_parts/FilterDefaults.vue';
import { ArrowLeftIcon } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const alert = useAlert();
const { isMobile } = useIsMobile();
const { defaults, isLoading, save } = useFilterDefaults();

async function submit() {
    if (await save()) alert.success(t('user.profile.saved'));
    else alert.error(t('validation.errors.default'));
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
            <RouterLink v-if="isMobile" :to="{ name: routesNames.settings }"
                        class="btn btn-soft btn-square" :aria-label="$t('actions.back')">
                <ArrowLeftIcon />
            </RouterLink>
            <h2 class="font-title text-xl md:text-2xl font-bold">{{ $t('user.settings.profile') }}</h2>
        </div>

        <section class="border border-base-300 bg-base-200 rounded-box p-4 shadow">
            <h3 class="font-bold">{{ $t('user.filterDefaults.title') }}</h3>
            <p class="text-sm opacity-70 mb-2">{{ $t('user.filterDefaults.help') }}</p>

            <FilterDefaults v-if="defaults" v-model="defaults" />
            <div v-else class="flex justify-center p-8">
                <span class="loading loading-spinner"></span>
            </div>

            <div class="flex justify-end mt-4">
                <button type="button" class="btn btn-primary" :disabled="isLoading || !defaults" @click="submit">
                    {{ $t('actions.save') }}
                </button>
            </div>
        </section>
    </div>
</template>
