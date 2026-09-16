<script setup lang="ts">
import { useConfirmation } from '@chapelure/ui/composables/useConfirmation';
import type { IEditModal } from '@chapelure/ui/composables/useModal';
import List from '@chapelure/ui/data/List.vue';
import TagSelect from '@chapelure/ui/data/TagSelect.vue';
import FilesInput from '@chapelure/ui/files/FilesInput.vue';
import FilesList from '@chapelure/ui/files/FilesList.vue';
import { useOneFile } from '@chapelure/ui/files/useFiles';
import Field from '@chapelure/ui/forms/Field.vue';
import FieldError from '@chapelure/ui/forms/FieldError.vue';
import Container from '@chapelure/ui/layout/Container.vue';
import Panel from '@chapelure/ui/layout/Panel.vue';
import TextEditor from '@chapelure/ui/primitives/TextEditor.vue';
import StepEditModal from '@features/activities-authoring/components/StepEdit.modal.vue';
import StepSummary from '@features/activities/components/StepSummary.vue';
import { useActivityEdit } from '@features/activities-authoring/composables/useActivityEdit';
import { type ActivityStepData } from '@features/activities/model/step';
import { ActivityState, availablesEnvironments } from '@features/activities/model/activity';
import { routesNames } from '@features/activities-authoring/routes';
import { ArrowLeftIcon, BadgeCheckIcon, LibraryIcon, ListOrderedIcon, MinusIcon, PenIcon, PlusIcon, SaveIcon, ScrollTextIcon, TriangleAlertIcon, UndoIcon } from 'lucide-vue-next';
import { useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';

const {
    activity,
    availableBenefits,
    selectedBenefits,
    isLoading,
    isAddingStep,
    isChangingState,
    transition,
    errors,
    save,
    changeState,
    addStep,
    replaceStep,
    detachStep,
} = useActivityEdit();

const { t } = useI18n();
const confirm = useConfirmation();
const modal = useTemplateRef<IEditModal<ActivityStepData>>('modal');

// XXX : the picture goes nowhere — the activities collection has no file field to store it in.
const { files, update: updateImage } = useOneFile();

// Adding writes the step first, so the modal only ever has one to update.
async function add() {
    const created = await addStep();
    if (created) await edit(created);
}

async function edit(step: ActivityStepData) {
    const updated = await modal.value?.show(step);
    if (updated) replaceStep(updated);
}

async function remove(step: ActivityStepData) {
    if (await confirm.show(t('confirmation.remove.title'), t('confirmation.remove.messageSimple'), TriangleAlertIcon) !== true)
        return;

    await detachStep(step);
}
</script>

<template>
    <Container>
        <div class="sticky top-0 flex gap-2 py-2 bg-base-100 z-10">
            <RouterLink class="btn btn-ghost" :to="{ name: routesNames.all }">
                <ArrowLeftIcon /> {{ $t('actions.back') }}
            </RouterLink>

            <!-- Publishing is its own write: it stores the state and leaves the form as it is. -->
            <button class="btn ms-auto" :disabled="isChangingState" @click="changeState">
                <span v-if="isChangingState" class="loading loading-spinner loading-sm"></span>
                <BadgeCheckIcon v-if="transition.to === ActivityState.VALIDATED" />
                <UndoIcon v-else />
                {{ $t(transition.label) }}
            </button>

            <button class="btn btn-primary" :disabled="isLoading" @click="save">
                <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
                <SaveIcon />
                {{ $t('actions.save') }}
            </button>
        </div>
        <FieldError :error="errors.global.value" />

        <Panel>
            <h2 class="text-2xl flex items-center gap-2">
                <LibraryIcon /> {{ $t('activities.edit.properties') }}
            </h2>
            <Field label="activities.fields.picture">
                <FilesInput accept="image/*" @change="updateImage">
                    <template #constraints>
                        {{ $t('activities.contraints.picture') }}
                    </template>
                </FilesInput>
                <FilesList :files />
            </Field>
            <div class="flex flex-1 flex-col">
                <Field label="activities.fields.name" :error="errors.get('name')">
                    <input type="text" class="input w-full" :class="{ 'input-error': !!errors.get('name') }"
                        v-model="activity.name" />
                </Field>
                <Field label="activities.fields.age">
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <span class="text-sm opacity-50">{{ $t('data.minimum') }}</span>
                            <input type="number" class="input w-full" min="0" v-model.number="activity.ageMin" />
                        </div>
                        <div>
                            <span class="text-sm opacity-50">{{ $t('data.maximum') }}</span>
                            <input type="number" class="input w-full" min="0" v-model.number="activity.ageMax" />
                        </div>
                    </div>
                </Field>
                <div class="grid grid-cols-2 gap-2">
                    <Field label="activities.fields.environment" :error="errors.get('environment')">
                        <select class="select w-full" v-model="activity.environment">
                            <option v-for="env in availablesEnvironments" :key="env.value" :value="env.value">
                                {{ $t(env.label) }}
                            </option>
                        </select>
                    </Field>
                    <Field label="activities.fields.durationMinutes">
                        <input type="number" class="input w-full" min="0" v-model.number="activity.durationMinutes" />
                    </Field>
                </div>
            </div>
            <Field label="activities.fields.benefits">
                <TagSelect :items="availableBenefits" display-key="name" v-model="selectedBenefits" />
            </Field>
        </Panel>

        <Panel>
            <h2 class="text-2xl flex items-center gap-2">
                <ScrollTextIcon /> {{ $t('activities.edit.description') }}
            </h2>
            <TextEditor v-model="activity.description" class="min-h-64" />
            <FieldError :error="errors.get('description')" />
        </Panel>

        <Panel>
            <h2 class="text-2xl flex items-center gap-2">
                <ListOrderedIcon /> {{ $t('activities.edit.steps') }}
            </h2>
            <button class="btn btn-primary" :disabled="isAddingStep" @click="add">
                <span v-if="isAddingStep" class="loading loading-spinner loading-sm"></span>
                <PlusIcon />
                {{ $t('actions.add') }}
            </button>
            <List :items="activity.steps" v-slot="{ item, index }">
                <StepSummary :index="index" :step="item" />

                <button class="btn btn-ghost btn-square" @click="() => remove(item)">
                    <MinusIcon />
                </button>
                <button class="btn btn-ghost btn-square" @click="() => edit(item)">
                    <PenIcon />
                </button>
            </List>
        </Panel>
    </Container>
    <StepEditModal ref="modal" />
</template>
