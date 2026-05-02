<script setup lang="ts">
import Container from '@chapelure/common/components/layout/Container.vue';
import Group from '@chapelure/common/components/layout/Group.vue';
import type { ActivityData } from '@features/activities/data/activities';
import { ArrowLeftIcon, ArrowRightIcon, FileTextIcon, LibraryIcon, ListTreeIcon } from 'lucide-vue-next';
import { routesNames } from '@features/activities/routes';

defineProps<{
    activity: ActivityData;
}>();
</script>

<template>
    <Container>
        <ul class="steps">
            <li class="step step-primary">
                <span class="flex gap-2 items-center">
                    <FileTextIcon /> {{ $t('activities.edit.description') }}
                </span>
            </li>
            <li class="step step-primary">
                <span class="flex gap-2 items-center">
                    <ListTreeIcon />
                    {{ $t('activities.edit.steps') }}
                </span>
            </li>
            <li class="step">
                <span class="flex gap-2 items-center">
                    <LibraryIcon />
                    {{ $t('activities.edit.properties') }}
                </span>
            </li>
        </ul>
        <Group>
        </Group>

        <div class="mt-auto flex">
            <RouterLink class="btn" :to="{name: routesNames.edit.description}">
                <ArrowLeftIcon />
                {{ $t('actions.previous') }}
            </RouterLink>
            <RouterLink class="btn btn-primary ms-auto" :to="{name: routesNames.edit.properties}">
                <ArrowRightIcon />
                {{ $t('actions.next') }}
            </RouterLink>
        </div>
    </Container>
</template>