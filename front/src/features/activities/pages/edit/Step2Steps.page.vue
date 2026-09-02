<script setup lang="ts">
import { useConfirmation } from '@chapelure/ui/composables/useConfirmation';
import { useEditableList } from '@chapelure/ui/composables/useEditableList';
import List from '@chapelure/ui/data/List.vue';
import { ArrowLeftIcon, ArrowRightIcon, MinusIcon, PenIcon, PlusIcon, TriangleAlertIcon } from 'lucide-vue-next';
import Container from '@chapelure/ui/layout/Container.vue';
import Panel from '@chapelure/ui/layout/Panel.vue';
import EditSteps from '@features/activities/pages/edit/_components/EditSteps.vue';
import StepEditModal from '@features/activities/pages/edit/_components/StepEditModal.vue';
import StepSummary from '@features/activities/components/steps/StepSummary.vue';
import { createEmptyStep, type ActivityData } from '@features/activities/model/activity';
import { routesNames } from '@features/activities/routes';
import { useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';

// XXX : the existing steps of `activity` are not seeded into the editable list yet,
// and the 3-step create flow has no save step — see WIP note in the activities feature.
defineProps<{
    activity: ActivityData;
}>();

const { t } = useI18n();
const modal = useTemplateRef('modal');
const { items, add, edit, remove } = useEditableList(modal, { onRemove: onRemove });
const confirm = useConfirmation();

async function onRemove() {
    if (await confirm.show(t('confirmation.remove.title'), t('confirmation.remove.messageSimple'), TriangleAlertIcon) !== true)
        return false;
    return true;
}
</script>

<template>
    <Container>
        <EditSteps current="steps" />
        <Panel class="flex-1">
            <button class="btn btn-primary" @click="() => add(createEmptyStep())">
                <PlusIcon />
                {{ $t("actions.add") }}
            </button>
            <List class="flex-1" :items="items" v-slot="{ item, index }">
                <StepSummary :index="index" :step="item" />

                <button class="btn btn-ghost btn-square" @click="() => remove(item, index)">
                    <MinusIcon />
                </button>
                <button class="btn btn-ghost btn-square" @click="() => edit(item)">
                    <PenIcon />
                </button>
            </List>
        </Panel>

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
