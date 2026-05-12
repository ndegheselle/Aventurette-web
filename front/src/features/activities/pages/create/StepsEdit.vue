<script setup lang="ts">
import List from '@chapelure/common/components/data/List.vue';
import Container from '@chapelure/common/components/layout/Container.vue';
import Group from '@chapelure/common/components/layout/Group.vue';
import type { ActivityData, ActivityStepData } from '@features/activities/composables/data/activities';
import StepSummary from '@features/activities/pages/steps/StepSummary.vue';
import { routesNames } from '@features/activities/routes';
import { ArrowLeftIcon, ArrowRightIcon, FileTextIcon, LibraryIcon, ListTreeIcon, MinusIcon, PenIcon, PlusIcon } from 'lucide-vue-next';

defineProps<{
    activity: ActivityData;
}>();

function remove(item: ActivityStepData, index: number) { }

function edit(item: ActivityStepData) { }
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
        <Group class="flex-1">
            <button class="btn btn-primary">
                <PlusIcon />
                {{ $t("actions.add") }}
            </button>
            <List class="flex-1"
                  :items="activity.expand?.steps"
                  v-slot="{ item, index }">
                <StepSummary :index="index"
                             :step="item" />

                <button class="btn btn-square btn-ghost"
                        @click="() => remove(item, index)">
                    <MinusIcon />
                </button>
                <button class="btn btn-square btn-ghost"
                        @click="() => edit(item)">
                    <PenIcon />
                </button>
            </List>
        </Group>

        <div class="mt-auto flex">
            <RouterLink class="btn"
                        :to="{ name: routesNames.edit.description }">
                <ArrowLeftIcon />
                {{ $t('actions.previous') }}
            </RouterLink>
            <RouterLink class="btn btn-primary ms-auto"
                        :to="{ name: routesNames.edit.properties }">
                <ArrowRightIcon />
                {{ $t('actions.next') }}
            </RouterLink>
        </div>
    </Container>
</template>