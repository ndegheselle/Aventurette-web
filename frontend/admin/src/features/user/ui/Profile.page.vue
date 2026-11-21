<!-- The settings' profile section: the filter defaults. A page of its own on a phone, beside the menu on a desktop. -->
<script setup lang="ts">
import { useAlert } from '@chapelure/ui/alerts/useAlert';
import { useIsMobile } from '@chapelure/ui/layout/useIsMobile';
import { Button } from '@chapelure/ui/shadcn/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@chapelure/ui/shadcn/card';
import { Spinner } from '@chapelure/ui/shadcn/spinner';
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
            <Button v-if="isMobile" as-child variant="secondary" size="icon">
                <RouterLink :to="{ name: routesNames.settings }" :aria-label="$t('actions.back')">
                    <ArrowLeftIcon />
                </RouterLink>
            </Button>
            <h2 class="font-title text-xl md:text-2xl font-bold">{{ $t('user.settings.profile') }}</h2>
        </div>

        <Card class="gap-4 py-4">
            <CardHeader class="px-4">
                <CardTitle>{{ $t('user.filterDefaults.title') }}</CardTitle>
                <CardDescription>{{ $t('user.filterDefaults.help') }}</CardDescription>
            </CardHeader>

            <CardContent class="px-4">
                <FilterDefaults v-if="defaults" v-model="defaults" />
                <div v-else class="flex justify-center p-8">
                    <Spinner class="size-6" />
                </div>
            </CardContent>

            <CardFooter class="justify-end px-4">
                <Button type="button" :disabled="isLoading || !defaults" @click="submit">
                    {{ $t('actions.save') }}
                </Button>
            </CardFooter>
        </Card>
    </div>
</template>
