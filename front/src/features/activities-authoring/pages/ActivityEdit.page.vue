<script setup lang="ts">
import List from '@chapelure/ui/data/List.vue';
import FilesInput from '@chapelure/ui/files/FilesInput.vue';
import FilesList from '@chapelure/ui/files/FilesList.vue';
import { useOneFile } from '@chapelure/ui/files/useFiles';
import Field from '@chapelure/ui/forms/Field.vue';
import FieldError from '@chapelure/ui/forms/FieldError.vue';
import TextEditor from '@chapelure/ui/forms/TextEditor.vue';
import MultiSelect from '@chapelure/ui/inputs/MultiSelect.vue';
import RangeInput from '@chapelure/ui/inputs/RangeInput.vue';
import TagSelect from '@chapelure/ui/inputs/TagSelect.vue';
import Container from '@chapelure/ui/layout/Container.vue';
import Panel from '@chapelure/ui/layout/Panel.vue';
import { useConfirmation } from '@chapelure/ui/modals/useConfirmation';
import type { IEditModal } from '@chapelure/ui/modals/useModal';
import MaterialsSelection from '@features/activities-authoring/components/MaterialsSelection.vue';
import StepEditModal from '@features/activities-authoring/components/StepEdit.modal.vue';
import WorkshopEditModal from '@features/activities-authoring/components/WorkshopEdit.modal.vue';
import { useActivityEdit, useTagOptions } from '@features/activities-authoring/composables/useActivityEdit';
import { AGE_BOUNDS, PARTICIPANTS_BOUNDS } from '@features/activities-authoring/model/activity.edit';
import { routesNames } from '@features/activities-authoring/routes';
import StepSummary from '@features/activities/components/StepSummary.vue';
import {
    ActivityFormat,
    ActivityLocation,
    ActivityPractice,
    ActivitySeason,
    ActivityState,
    ChildrenPace,
    DEVELOPMENT_AXES,
    HostEffort,
    ImaginaryRule,
} from '@features/activities/model/activity';
import { type ActivityStepData } from '@features/activities/model/step';
import { type ActivityWorkshopData } from '@features/activities/model/workshop';
import {
    TrashIcon,
    ArrowLeftIcon,
    BadgeCheckIcon,
    BookOpenIcon,
    GraduationCapIcon,
    LibraryIcon,
    ListOrderedIcon,
    MapPinIcon,
    MinusIcon,
    PackageOpenIcon,
    PenIcon,
    PlusIcon,
    SaveIcon,
    ScrollTextIcon,
    ShapesIcon,
    ShieldAlertIcon,
    SparklesIcon,
    TriangleAlertIcon,
    UndoIcon,
    UserCheckIcon,
    UsersIcon,
} from 'lucide-vue-next';
import { useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';

const {
    activity,
    isLoading,
    isAddingStep,
    isAddingWorkshop,
    isChangingState,
    transition,
    ageMin,
    ageMax,
    ageLabel,
    participantsMin,
    participantsMax,
    participantsLabel,
    timing,
    errors,
    save,
    changeState,
    addStep,
    replaceStep,
    detachStep,
    addMaterial,
    updateMaterial,
    removeMaterial,
    addWorkshop,
    replaceWorkshop,
    removeWorkshop,
} = useActivityEdit();

const { tagOptions } = useTagOptions();

const { t } = useI18n();
const confirm = useConfirmation();
const stepModal = useTemplateRef<IEditModal<ActivityStepData>>('stepModal');
const workshopModal = useTemplateRef<IEditModal<ActivityWorkshopData>>('workshopModal');

const formats = Object.values(ActivityFormat);
const practices = Object.values(ActivityPractice);
const imaginaryRules = Object.values(ImaginaryRule);
const childrenPaces = Object.values(ChildrenPace);
const hostEfforts = Object.values(HostEffort);
const locations = Object.values(ActivityLocation);
const seasons = Object.values(ActivitySeason);

// XXX : the picture goes nowhere — the collection's `visual` field is not wired to the form yet.
const { files, update: updateImage } = useOneFile();

// Adding writes the record first, so a modal only ever has one to update.
async function addAndEditStep() {
    const created = await addStep();
    if (created) await editStep(created);
}

async function editStep(step: ActivityStepData) {
    const updated = await stepModal.value?.show(step);
    if (updated) replaceStep(updated);
}

async function addAndEditWorkshop() {
    const created = await addWorkshop();
    if (created) await editWorkshop(created);
}

async function editWorkshop(workshop: ActivityWorkshopData) {
    const updated = await workshopModal.value?.show(workshop);
    if (updated) replaceWorkshop(updated);
}

async function confirmed(): Promise<boolean> {
    return await confirm.show(t('confirmation.remove.title'), t('confirmation.remove.messageSimple'), TriangleAlertIcon) === true;
}

async function confirmRemoveStep(step: ActivityStepData) {
    if (await confirmed()) await detachStep(step);
}

async function confirmRemoveWorkshop(workshop: ActivityWorkshopData) {
    if (await confirmed()) await removeWorkshop(workshop);
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

        <div class="grid gap-2 col-2">

        </div>
        <Panel>
            <h2 class="text-2xl flex items-center gap-2">
                <LibraryIcon /> {{ $t('activities.families.informations') }}
            </h2>
            <Field label="activities.fields.name" :error="errors.get('name')">
                <input type="text" class="input w-full" :class="{ 'input-error': !!errors.get('name') }"
                    v-model="activity.name" />
            </Field>
            <Field label="activities.fields.picture">
                <FilesInput accept="image/*" @change="updateImage">
                    <template #constraints>
                        {{ $t('activities.constraints.picture') }}
                    </template>
                </FilesInput>
                <FilesList :files />
            </Field>
        </Panel>

        <Panel>
            <h2 class="text-2xl flex items-center gap-2">
                <ScrollTextIcon /> {{ $t('activities.authoring.description') }}
            </h2>
            <TextEditor v-model="activity.description" class="min-h-64" />
            <FieldError :error="errors.get('description')" />
        </Panel>

        <!-- Optional selects: an empty string is how PocketBase stores "none". -->
        <Panel>
            <div class="tabs tabs-box">
                <label class="tab gap-2">
                    <input type="radio" name="activity-families" checked />
                    <ShapesIcon /> {{ $t('activities.families.classification') }}
                </label>
                <div class="tab-content p-3">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                        <Field label="activities.fields.format" :error="errors.get('format')">
                            <select class="select w-full" v-model="activity.classification.format">
                                <option value="">{{ $t('activities.fields.unset') }}</option>
                                <option v-for="value in formats" :key="value" :value="value">
                                    {{ $t(`activities.format.${value}`) }}
                                </option>
                            </select>
                        </Field>
                        <Field label="activities.tagType.THEME" :error="errors.get('theme_tags')">
                            <TagSelect :items="tagOptions.THEME" displayKey="name" keyBy="id"
                                v-model="activity.classification.themes" />
                        </Field>
                    </div>
                    <Field label="activities.fields.practices" :error="errors.get('practices')">
                        <MultiSelect :items="practices" :display="value => $t(`activities.practice.${value}`)"
                            v-model="activity.classification.practices" />
                    </Field>
                </div>

                <label class="tab gap-2">
                    <input type="radio" name="activity-families" />
                    <SparklesIcon /> {{ $t('activities.families.imaginary') }}
                </label>
                <div class="tab-content p-3">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                        <Field label="activities.fields.imaginaryRule" :error="errors.get('imaginary_rule')">
                            <select class="select w-full" v-model="activity.imaginary.rule">
                                <option value="">{{ $t('activities.fields.unset') }}</option>
                                <option v-for="value in imaginaryRules" :key="value" :value="value">
                                    {{ $t(`activities.imaginaryRule.${value}`) }}
                                </option>
                            </select>
                        </Field>
                        <Field label="activities.tagType.IMAGINARY" :error="errors.get('imaginary_tags')">
                            <TagSelect :items="tagOptions.IMAGINARY" displayKey="name" keyBy="id"
                                v-model="activity.imaginary.universes" />
                        </Field>
                    </div>
                </div>

                <label class="tab gap-2">
                    <input type="radio" name="activity-families" />
                    <UsersIcon /> {{ $t('activities.families.audience') }}
                </label>
                <div class="tab-content p-3">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                        <Field :error="errors.get('age_min') || errors.get('age_max')">
                            <template #label>
                                {{ $t('activities.fields.age') }}
                                <span class="font-normal opacity-60">{{ $t(ageLabel.key, ageLabel.params) }}</span>
                            </template>
                            <RangeInput class="text-primary" v-bind="AGE_BOUNDS" v-model:min="ageMin"
                                v-model:max="ageMax" />
                        </Field>
                        <Field :error="errors.get('participants_min') || errors.get('participants_max')">
                            <template #label>
                                {{ $t('activities.fields.participants') }}
                                <span class="font-normal opacity-60">{{ $t(participantsLabel.key,
                                    participantsLabel.params)
                                    }}</span>
                            </template>
                            <RangeInput class="text-primary" v-bind="PARTICIPANTS_BOUNDS" v-model:min="participantsMin"
                                v-model:max="participantsMax" />
                        </Field>
                        <Field label="activities.fields.childrenPace" :error="errors.get('children_pace')">
                            <select class="select w-full" v-model="activity.audience.childrenPace">
                                <option value="">{{ $t('activities.fields.unset') }}</option>
                                <option v-for="value in childrenPaces" :key="value" :value="value">
                                    {{ $t(`activities.childrenPace.${value}`) }}
                                </option>
                            </select>
                        </Field>
                    </div>
                    <Field label="activities.fields.ageVariants" :error="errors.get('age_variants')">
                        <TextEditor v-model="activity.audience.ageVariants" class="min-h-24" />
                    </Field>
                </div>

                <label class="tab gap-2">
                    <input type="radio" name="activity-families" />
                    <UserCheckIcon /> {{ $t('activities.families.supervision') }}
                </label>
                <div class="tab-content p-3">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                        <Field label="activities.fields.hostEffort" :error="errors.get('host_effort')">
                            <select class="select w-full" v-model="activity.supervision.hostEffort">
                                <option value="">{{ $t('activities.fields.unset') }}</option>
                                <option v-for="value in hostEfforts" :key="value" :value="value">
                                    {{ $t(`activities.hostEffort.${value}`) }}
                                </option>
                            </select>
                        </Field>
                        <Field label="activities.fields.hosts" :error="errors.get('recommended_hosts_numbers')">
                            <input type="number" min="0" class="input w-full"
                                :class="{ 'input-error': !!errors.get('recommended_hosts_numbers') }"
                                v-model.number="activity.supervision.hostsRequired" />
                        </Field>
                    </div>
                    <label class="label mt-2">
                        <input type="checkbox" class="checkbox checkbox-sm"
                            v-model="activity.supervision.crossSupervision" />
                        {{ $t('activities.fields.crossSupervision') }}
                    </label>
                    <Field label="activities.fields.supervisionNotes" :error="errors.get('supervision_notes')">
                        <TextEditor v-model="activity.supervision.notes" class="min-h-24" />
                    </Field>
                </div>

                <label class="tab gap-2">
                    <input type="radio" name="activity-families" />
                    <MapPinIcon /> {{ $t('activities.families.place') }}
                </label>
                <div class="tab-content p-3">
                    <div class="flex gap-4">
                        <label class="label">
                            <input type="checkbox" class="checkbox checkbox-sm" v-model="activity.place.indoor" />
                            {{ $t('activities.fields.indoor') }}
                        </label>
                        <label class="label">
                            <input type="checkbox" class="checkbox checkbox-sm" v-model="activity.place.outdoor" />
                            {{ $t('activities.fields.outdoor') }}
                        </label>
                    </div>
                    <Field label="activities.fields.seasons" :error="errors.get('seasons')">
                        <MultiSelect :items="seasons" :display="value => $t(`activities.season.${value}`)"
                            v-model="activity.place.seasons" />
                    </Field>
                    <Field label="activities.fields.locations" :error="errors.get('locations')">
                        <MultiSelect :items="locations" :display="value => $t(`activities.location.${value}`)"
                            v-model="activity.place.locations" />
                    </Field>
                    <Field label="activities.fields.conditions" :error="errors.get('conditions')">
                        <TextEditor v-model="activity.place.conditions" class="min-h-24" />
                    </Field>
                </div>

                <label class="tab gap-2">
                    <input type="radio" name="activity-families" />
                    <ShieldAlertIcon /> {{ $t('activities.families.safety') }}
                </label>
                <div class="tab-content p-3">
                    <Field label="activities.tagType.SECURITY" :error="errors.get('safety_tags')">
                        <TagSelect :items="tagOptions.SECURITY" displayKey="name" keyBy="id"
                            v-model="activity.safety.tags" />
                    </Field>
                </div>

                <label class="tab gap-2">
                    <input type="radio" name="activity-families" />
                    <GraduationCapIcon /> {{ $t('activities.families.pedagogy') }}
                </label>
                <div class="tab-content p-3">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-2">
                        <Field label="activities.tagType.GOAL" :error="errors.get('goal_tags')">
                            <TagSelect :items="tagOptions.GOAL" displayKey="name" keyBy="id"
                                v-model="activity.pedagogy.goals" />
                        </Field>
                        <Field label="activities.tagType.IDEAL_FOR" :error="errors.get('ideal_for_tags')">
                            <TagSelect :items="tagOptions.IDEAL_FOR" displayKey="name" keyBy="id"
                                v-model="activity.pedagogy.idealFor" />
                        </Field>
                        <Field v-for="axis in DEVELOPMENT_AXES" :key="axis" :label="`activities.tagType.${axis}`">
                            <TagSelect :items="tagOptions[axis]" displayKey="name" keyBy="id"
                                v-model="activity.pedagogy.development[axis]" />
                        </Field>
                    </div>
                    <!-- The six axes share one relation, so its error shows once, under all of them. -->
                    <FieldError :error="errors.get('development_tags')" />
                </div>
            </div>
        </Panel>

        <Panel>
            <h2 class="text-2xl flex items-center gap-2">
                <PackageOpenIcon /> {{ $t('activities.materials.title') }}
            </h2>
            <MaterialsSelection v-model="activity.materials" @add="addMaterial" @update="updateMaterial"
                @remove="removeMaterial" />
        </Panel>

        <Panel>
            <h2 class="text-2xl flex items-center gap-2">
                <BookOpenIcon /> {{ $t('activities.workshops.title') }}
            </h2>
            <button class="btn btn-primary" :disabled="isAddingWorkshop" @click="addAndEditWorkshop">
                <span v-if="isAddingWorkshop" class="loading loading-spinner loading-sm"></span>
                <PlusIcon />
                {{ $t('actions.add') }}
            </button>
            <List :items="activity.workshops" v-slot="{ item }">
                <div>
                    <b>{{ item.name }}</b>
                    <span v-if="item.theme" class="ms-2 text-sm opacity-60">{{ item.theme }}</span>
                </div>
                <span v-if="item.adults_required" class="badge my-auto">
                    {{ $t('activities.workshops.adults', { count: item.adults_required }) }}
                </span>

                <div class="ms-auto my-auto flex gap-2">
                    <button class="btn btn-soft btn-error btn-square" @click="() => confirmRemoveWorkshop(item)">
                        <TrashIcon class="icon-sm" />
                    </button>
                    <button class="btn btn-soft btn-square" @click="() => editWorkshop(item)">
                        <PenIcon class="icon-sm" />
                    </button>
                </div>
            </List>
        </Panel>

        <Panel>
            <h2 class="text-2xl flex items-center gap-2">
                <ListOrderedIcon /> {{ $t('activities.authoring.steps.title') }}
                <span class="ms-auto text-sm font-normal opacity-60">
                    {{ $t('activities.fields.preparationTime') }} {{ $t('activities.minutes', {
                        minutes:
                            timing.preparation
                    })
                    }}
                    · {{ $t('activities.fields.playTime') }} {{ $t('activities.minutes', { minutes: timing.play }) }}
                </span>
            </h2>
            <button class="btn btn-primary" :disabled="isAddingStep" @click="addAndEditStep">
                <span v-if="isAddingStep" class="loading loading-spinner loading-sm"></span>
                <PlusIcon />
                {{ $t('actions.add') }}
            </button>
            <List :items="activity.steps" v-slot="{ item, index }">
                <StepSummary :index="index" :step="item" />

                <div class="my-auto flex gap-2">
                    <button class="btn btn-soft btn-error btn-square" @click="() => confirmRemoveStep(item)">
                        <TrashIcon class="icon-sm" />
                    </button>
                    <button class="btn btn-soft btn-square" @click="() => editStep(item)">
                        <PenIcon class="icon-sm" />
                    </button>
                </div>
            </List>
        </Panel>
    </Container>
    <StepEditModal ref="stepModal" :materials="activity.materials" />
    <WorkshopEditModal ref="workshopModal" :materials="activity.materials" />
</template>
