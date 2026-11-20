<!-- Shown once, at the first sign-in: the filter defaults, to set now or later. -->
<script setup lang="ts">
import { useAlert } from '@chapelure/ui/alerts/useAlert';
import { Button } from '@chapelure/ui/shadcn/button';
import { Spinner } from '@chapelure/ui/shadcn/spinner';
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
            <p class="text-muted-foreground">{{ $t('user.onboarding.intro') }}</p>
        </div>

        <FilterDefaults v-if="defaults" v-model="defaults" />
        <div v-else class="flex justify-center p-8">
            <Spinner class="size-6" />
        </div>

        <div class="mt-auto flex justify-end gap-2">
            <Button type="button" variant="ghost" :disabled="isLoading" @click="() => leaveAfter(skip)">
                {{ $t('user.onboarding.later') }}
            </Button>
            <Button type="button" :disabled="isLoading || !defaults"
                    @click="() => leaveAfter(save)">
                {{ $t('actions.save') }}
            </Button>
        </div>
    </div>
</template>
