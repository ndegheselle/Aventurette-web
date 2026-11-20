<!-- Shown once, at the first sign-in: the filter defaults, to set now or later. -->
<script setup lang="ts">
import { useAlert } from '@chapelure/ui/alerts/useAlert';
import { useFilterDefaults } from '@features/user/composables/useFilterDefaults';
import FilterDefaults from '@features/user/ui/_parts/FilterDefaults.vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const alert = useAlert();
const router = useRouter();
const { defaults, isLoading, save, skip } = useFilterDefaults();

async function leaveAfter(action: () => Promise<boolean>) {
    if (await action()) router.push('/');
    else alert.error(t('validation.errors.default'));
}
</script>

<template>
    <div class="flex flex-1 flex-col w-full max-w-xl mx-auto p-4 gap-4">
        <div>
            <h1 class="font-title text-2xl md:text-3xl font-bold">{{ $t('user.onboarding.title') }}</h1>
            <p class="opacity-70">{{ $t('user.onboarding.intro') }}</p>
        </div>

        <FilterDefaults v-if="defaults" v-model="defaults" />
        <div v-else class="flex justify-center p-8">
            <span class="loading loading-spinner"></span>
        </div>

        <div class="mt-auto flex justify-end gap-2">
            <button type="button" class="btn btn-ghost" :disabled="isLoading" @click="() => leaveAfter(skip)">
                {{ $t('user.onboarding.later') }}
            </button>
            <button type="button" class="btn btn-primary" :disabled="isLoading || !defaults"
                    @click="() => leaveAfter(save)">
                {{ $t('actions.save') }}
            </button>
        </div>
    </div>
</template>
