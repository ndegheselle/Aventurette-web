<script setup lang="ts">
import List from '@chapelure/ui/data/List.vue';
import FilesInput from '@chapelure/ui/files/FilesInput.vue';
import FilesList from '@chapelure/ui/files/FilesList.vue';
import { useOneFile } from '@chapelure/ui/files/useFiles';
import Field from '@chapelure/ui/forms/Field.vue';
import FieldError from '@chapelure/ui/forms/FieldError.vue';
import TextEditor from '@chapelure/ui/forms/TextEditor.vue';
import RangeInput from '@chapelure/ui/inputs/RangeInput.vue';
import Container from '@chapelure/ui/layout/Container.vue';
import Panel from '@chapelure/ui/layout/Panel.vue';
import { useConfirmation } from '@chapelure/ui/modals/useConfirmation';
import type { IEditModal } from '@chapelure/ui/modals/useModal';
import StepEditModal from '@features/activities-authoring/components/StepEdit.modal.vue';
import TagsSelection from '@features/activities-authoring/components/TagsSelection.vue';
import { useActivityEdit } from '@features/activities-authoring/composables/useActivityEdit';
import { AGE_BOUNDS, PARTICIPANTS_BOUNDS } from '@features/activities-authoring/model/activity.edit';
import { routesNames } from '@features/activities-authoring/routes';
import StepSummary from '@features/activities/components/StepSummary.vue';
import {
    ActivitiesEnergyLevel,
    ActivitiesEnvironnement,
    ActivitiesSeason,
    ActivitiesWeather,
    ActivityState,
} from '@features/activities/model/activity';
import { type ActivityStepData } from '@features/activities/model/step';
import { ArrowLeftIcon, BadgeCheckIcon, LibraryIcon, ListOrderedIcon, MinusIcon, PenIcon, PlusIcon, SaveIcon, ScrollTextIcon, TagsIcon, TriangleAlertIcon, UndoIcon } from 'lucide-vue-next';
import { useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';

const {
    activity,
    isLoading,
    isAddingStep,
    isChangingState,
    transition,
    ageMin,
    ageMax,
    ageLabel,
    participantsMin,
    participantsMax,
    participantsLabel,
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

const environnements = Object.values(ActivitiesEnvironnement);
const seasons = Object.values(ActivitiesSeason);
const weathers = Object.values(ActivitiesWeather);
const energyLevels = Object.values(ActivitiesEnergyLevel);

// XXX : the picture goes nowhere — the collection's `visual` field is not wired to the form yet.
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

            <!-- Its own write: stores the state and leaves the form as it is. -->
            <button class="btn ms-auto" :disabled="isChangingState" @click="changeState">
                <span v-if="isChangingState" class="loading loading-spinner loading-sm"></span>
                <BadgeCheckIcon v-if="transition.to === ActivityState.PUBLISHED" />
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
                <LibraryIcon /> {{ $t('activities.authoring.properties') }}
            </h2>
            <Field label="activities.fields.picture">
                <FilesInput accept="image/*" @change="updateImage">
                    <template #constraints>
                        {{ $t('activities.constraints.picture') }}
                    </template>
                </FilesInput>
                <FilesList :files />
            </Field>
            <div class="flex flex-1 flex-col">
                <Field label="activities.fields.name" :error="errors.get('name')">
                    <input type="text" class="input w-full" :class="{ 'input-error': !!errors.get('name') }"
                        v-model="activity.name" />
                </Field>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                    <Field label="activities.fields.environnement" :error="errors.get('environnement')">
                        <select class="select w-full" :class="{ 'select-error': !!errors.get('environnement') }"
                            v-model="activity.environnement">
                            <option v-for="value in environnements" :key="value" :value="value">
                                {{ $t(`activities.environnement.${value}`) }}
                            </option>
                        </select>
                    </Field>
                    <Field label="activities.fields.hosts" :error="errors.get('recommended_hosts_numbers')">
                        <input type="number" min="0" class="input w-full"
                            :class="{ 'input-error': !!errors.get('recommended_hosts_numbers') }"
                            v-model.number="activity.recommended_hosts_numbers" />
                    </Field>
                    <Field :error="errors.get('age_min') || errors.get('age_max')">
                        <template #label>
                            {{ $t('activities.fields.age') }}
                            <span class="font-normal opacity-60">{{ $t(ageLabel.key, ageLabel.params) }}</span>
                        </template>
                        <RangeInput class="text-primary" v-bind="AGE_BOUNDS"
                            v-model:min="ageMin" v-model:max="ageMax" />
                    </Field>
                    <Field :error="errors.get('participants_min') || errors.get('participants_max')">
                        <template #label>
                            {{ $t('activities.fields.participants') }}
                            <span class="font-normal opacity-60">{{ $t(participantsLabel.key, participantsLabel.params) }}</span>
                        </template>
                        <RangeInput class="text-primary" v-bind="PARTICIPANTS_BOUNDS"
                            v-model:min="participantsMin" v-model:max="participantsMax" />
                    </Field>
                    <!-- Optional columns: an empty string is how PocketBase stores "none" for a select. -->
                    <Field label="activities.fields.season" :error="errors.get('season')">
                        <select class="select w-full" :class="{ 'select-error': !!errors.get('season') }"
                            v-model="activity.season">
                            <option value="">{{ $t('activities.fields.unset') }}</option>
                            <option v-for="value in seasons" :key="value" :value="value">
                                {{ $t(`activities.season.${value}`) }}
                            </option>
                        </select>
                    </Field>
                    <Field label="activities.fields.weather" :error="errors.get('weather')">
                        <select class="select w-full" :class="{ 'select-error': !!errors.get('weather') }"
                            v-model="activity.weather">
                            <option value="">{{ $t('activities.fields.unset') }}</option>
                            <option v-for="value in weathers" :key="value" :value="value">
                                {{ $t(`activities.weather.${value}`) }}
                            </option>
                        </select>
                    </Field>
                    <Field label="activities.fields.energy_level" :error="errors.get('energy_level')">
                        <select class="select w-full" :class="{ 'select-error': !!errors.get('energy_level') }"
                            v-model="activity.energy_level">
                            <option value="">{{ $t('activities.fields.unset') }}</option>
                            <option v-for="value in energyLevels" :key="value" :value="value">
                                {{ $t(`activities.energy_level.${value}`) }}
                            </option>
                        </select>
                    </Field>
                </div>
            </div>
        </Panel>

        <Panel>
            <h2 class="text-2xl flex items-center gap-2">
                <TagsIcon /> {{ $t('activities.authoring.tags') }}
            </h2>
            <TagsSelection v-model="activity.tags" />
            <FieldError :error="errors.get('tags')" />
        </Panel>

        <Panel>
            <h2 class="text-2xl flex items-center gap-2">
                <ScrollTextIcon /> {{ $t('activities.authoring.description') }}
            </h2>
            <TextEditor v-model="activity.description" class="min-h-64" />
            <FieldError :error="errors.get('description')" />
        </Panel>

        <Panel>
            <h2 class="text-2xl flex items-center gap-2">
                <ListOrderedIcon /> {{ $t('activities.authoring.steps') }}
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
