<script setup lang="ts">
import List from '@chapelure/ui/data/List.vue';
import Container from '@chapelure/ui/layout/Container.vue';
import Card from '@chapelure/ui/layout/Card.vue';
import { useEditableList } from '@chapelure/ui/composables/useEditableList';
import { useConfirmation } from '@chapelure/ui/composables/useConfirmation';
import StepEditModal from '@features/activities/components/steps/StepEditModal.vue';
import StepSummary from '@features/activities/components/steps/StepSummary.vue';
import { type ActivityData, createEmptyStep } from '@features/activities/composables/data/activities';
import { routesNames } from '@features/activities/routes';
import { ArrowLeftIcon, ArrowRightIcon, FileTextIcon, LibraryIcon, ListTreeIcon, MinusIcon, PenIcon, PlusIcon, TriangleAlertIcon } from '@chapelure/ui/icons';
import { useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';

// XXX : the existing steps of `activity` are not seeded into the editable list yet,
// and the 3-step create flow has no save step — see WIP note in the activities feature.
defineProps<{
    activity: ActivityData;
}>();

const { t } = useI18n();
const modal = useTemplateRef('modal');
const {items, add, edit, remove} = useEditableList(modal, {onRemove: onRemove});
const confirm = useConfirmation();

async function onRemove() {
    if (await confirm.show(t('confirmation.remove.title'), t('confirmation.remove.messageSimple'), TriangleAlertIcon) !== true)
        return false;
    return true;
}

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
        <Card class="flex-1">
            <button class="btn btn-primary" @click="() => add(createEmptyStep())">
                <PlusIcon />
                {{ $t("actions.add") }}
            </button>
            <List class="flex-1" :items="items" v-slot="{ item, index }">
                <StepSummary :index="index" :step="item" />

                <button class="btn btn-square btn-ghost" @click="() => remove(item, index)">
                    <MinusIcon />
                </button>
                <button class="btn btn-square btn-ghost" @click="() => edit(item)">
                    <PenIcon />
                </button>
            </List>
        </Card>

        <div class="mt-auto flex">
            <RouterLink class="btn" :to="{ name: routesNames.edit.description }">
                <ArrowLeftIcon />
                {{ $t('actions.previous') }}
            </RouterLink>
            <RouterLink class="btn btn-primary ms-auto" :to="{ name: routesNames.edit.properties }">
                <ArrowRightIcon />
                {{ $t('actions.next') }}
            </RouterLink>
        </div>
    </Container>
    <StepEditModal ref="modal" />
</template>