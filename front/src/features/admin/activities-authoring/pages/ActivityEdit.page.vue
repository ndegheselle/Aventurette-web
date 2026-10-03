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
import StepSummary from '@features/activities/components/StepSummary.vue';
import {
    ActivityFormat,
    ActivityState,
    ChildrenPace,
    DEVELOPMENT_AXES,
    HostEffort,
    ImaginaryRule,
} from '@features/activities/model/activity';
import { type ActivityStepData } from '@features/activities/model/step';
import { type ActivityWorkshopData } from '@features/activities/model/workshop';
import MaterialsSelection from '@features/admin/activities-authoring/components/MaterialsSelection.vue';
import SectionsMenuModal from '@features/admin/activities-authoring/components/SectionsMenu.modal.vue';
import SectionsMenu, { type SectionEntry } from '@features/admin/activities-authoring/components/SectionsMenu.vue';
import StepEditModal from '@features/admin/activities-authoring/components/StepEdit.modal.vue';
import WorkshopEditModal from '@features/admin/activities-authoring/components/WorkshopEdit.modal.vue';
import { useActivityEdit, useReferenceOptions } from '@features/admin/activities-authoring/composables/useActivityEdit';
import { AGE_BOUNDS, PARTICIPANTS_BOUNDS } from '@features/admin/activities-authoring/model/activity.edit';
import { routesNames } from '@features/admin/activities-authoring/routes';
import {
    ArrowLeftIcon,
    BadgeCheckIcon,
    BookOpenIcon,
    ClipboardCheckIcon,
    ClipboardListIcon,
    GraduationCapIcon,
    LibraryIcon,
    LightbulbIcon,
    ListOrderedIcon,
    MapPinIcon,
    PackageOpenIcon,
    PenIcon,
    PlusIcon,
    SaveIcon,
    ScrollTextIcon,
    ShapesIcon,
    ShieldAlertIcon,
    SparklesIcon,
    TableOfContentsIcon,
    TrashIcon,
    TriangleAlertIcon,
    UndoIcon,
    UserCheckIcon,
    UsersIcon,
} from 'lucide-vue-next';
import { ref, useTemplateRef, type Component, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';

const {
    activity,
    isNew,
    isLoading,
    isChangingState,
    transition,
    ageMin,
    ageMax,
    ageLabel,
    participantsMin,
    participantsMax,
    participantsLabel,
    practiceOptions,
    practices,
    seasonOptions,
    seasons,
    locationOptions,
    locations,
    timing,
    errors,
    save,
    changeState,
    newStep,
    putStep,
    removeStep,
    addMaterial,
    createMaterial,
    removeMaterial,
    newWorkshop,
    putWorkshop,
    removeWorkshop,
} = useActivityEdit();

const { tagOptions, safetyInstructions, tips } = useReferenceOptions();

const { t } = useI18n();
const confirm = useConfirmation();
const stepModal = useTemplateRef<IEditModal<ActivityStepData>>('stepModal');
const workshopModal = useTemplateRef<IEditModal<ActivityWorkshopData>>('workshopModal');
const sectionsModal = useTemplateRef<InstanceType<typeof SectionsMenuModal>>('sectionsModal');

const familyTab = ref('classification');
const preparationTab = ref('safety');

// A tabbed panel's entries open their tab, then bring the panel into view.
function tabEntry(tab: Ref<string>, anchor: string, key: string, label: string, icon: Component): SectionEntry {
    return { key, label, icon, anchor, onSelect: () => tab.value = key };
}

function familyEntry(key: string, icon: Component): SectionEntry {
    return tabEntry(familyTab, 'section-families', key, `activities.families.${key}`, icon);
}

function preparationEntry(key: string, label: string, icon: Component): SectionEntry {
    return tabEntry(preparationTab, 'section-preparation', key, label, icon);
}

const sections: SectionEntry[] = [
    { key: 'informations', label: 'activities.families.informations', icon: LibraryIcon, anchor: 'section-informations' },
    { key: 'description', label: 'activities.authoring.description', icon: ScrollTextIcon, anchor: 'section-description' },
    {
        key: 'families',
        label: 'activities.authoring.navigation.families',
        icon: ClipboardListIcon,
        anchor: 'section-families',
        children: [
            familyEntry('classification', ShapesIcon),
            familyEntry('imaginary', SparklesIcon),
            familyEntry('audience', UsersIcon),
            familyEntry('supervision', UserCheckIcon),
            familyEntry('place', MapPinIcon),
            familyEntry('pedagogy', GraduationCapIcon),
        ],
    },
    {
        key: 'preparation',
        label: 'activities.authoring.navigation.preparation',
        icon: ClipboardCheckIcon,
        anchor: 'section-preparation',
        children: [
            preparationEntry('safety', 'activities.families.safety', ShieldAlertIcon),
            preparationEntry('materials', 'activities.materials.title', PackageOpenIcon),
            preparationEntry('tips', 'activities.tips.title', LightbulbIcon),
        ],
    },
    { key: 'workshops', label: 'activities.workshops.title', icon: BookOpenIcon, anchor: 'section-workshops' },
    { key: 'steps', label: 'activities.authoring.steps.title', icon: ListOrderedIcon, anchor: 'section-steps' },
];

function goTo(entry: SectionEntry) {
    entry.onSelect?.();
    document.getElementById(entry.anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function openSections() {
    const entry = await sectionsModal.value?.show();
    if (entry) goTo(entry);
}

const formats = Object.values(ActivityFormat);
const imaginaryRules = Object.values(ImaginaryRule);
const childrenPaces = Object.values(ChildrenPace);
const hostEfforts = Object.values(HostEffort);

// XXX : the picture goes nowhere — the collection's `visual` field is not wired to the form yet.
const { files, update: updateImage } = useOneFile();

// A modal edits a copy, so a new record joins the activity only once confirmed. Either way,
// nothing is written until the activity is saved.
async function editStep(step: ActivityStepData) {
    const edited = await stepModal.value?.show(step);
    if (edited) putStep(edited);
}

async function editWorkshop(workshop: ActivityWorkshopData) {
    const edited = await workshopModal.value?.show(workshop);
    if (edited) putWorkshop(edited);
}

async function confirmed(): Promise<boolean> {
    return await confirm.show(t('confirmation.remove.title'), t('confirmation.remove.messageSimple'), TriangleAlertIcon) === true;
}

async function confirmRemoveStep(step: ActivityStepData) {
    if (await confirmed()) removeStep(step);
}

async function confirmRemoveWorkshop(workshop: ActivityWorkshopData) {
    if (await confirmed()) removeWorkshop(workshop);
}
</script>

<template>
    <Container>
        <div class="sticky top-0 flex gap-2 py-2 bg-base-100 z-10">
            <RouterLink class="btn btn-ghost" :to="{ name: routesNames.all }">
                <ArrowLeftIcon class="opacity-50" /> {{ $t('actions.back') }}
            </RouterLink>
            <button class="btn btn-ghost btn-square lg:hidden" :aria-label="$t('activities.authoring.navigation.title')"
                @click="openSections">
                <TableOfContentsIcon class="opacity-50" />
            </button>

            <!-- Its own write: stores the state and leaves the form as it is. A new activity has
                 no record to write it to until its first save. -->
            <div class="tooltip tooltip-bottom sm:before:hidden sm:after:hidden ms-auto"
                :data-tip="$t(transition.label)">
                <button class="btn" :disabled="isChangingState || isNew" @click="changeState">
                    <span v-if="isChangingState" class="loading loading-spinner loading-sm"></span>
                    <BadgeCheckIcon v-if="transition.to === ActivityState.PUBLISHED" />
                    <UndoIcon v-else />
                    <span class="sr-only sm:not-sr-only">{{ $t(transition.label) }}</span>
                </button>
            </div>

            <div class="tooltip tooltip-bottom sm:before:hidden sm:after:hidden" :data-tip="$t('actions.save')">
                <button class="btn btn-primary" :disabled="isLoading" @click="save">
                    <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
                    <SaveIcon class="opacity-50" />
                    <span class="sr-only sm:not-sr-only">{{ $t('actions.save') }}</span>
                </button>
            </div>
        </div>
        <FieldError :error="errors.global.value" />

        <div class="grid gap-2 items-start lg:grid-cols-[14rem_minmax(0,1fr)]">
            <aside class="hidden lg:block sticky top-16 rounded-box bg-base-200 shadow">
                <SectionsMenu :entries="sections" @select="goTo" />
            </aside>

            <div class="flex flex-col gap-2">
                <Panel id="section-informations" class="scroll-mt-16">
                    <h2 class="text-2xl flex items-center gap-2">
                        <LibraryIcon class="opacity-50" /> {{ $t('activities.families.informations') }}
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
                        <FilesList v-model:files="files" />
                    </Field>
                </Panel>

                <Panel id="section-description" class="scroll-mt-16">
                    <h2 class="text-2xl flex items-center gap-2">
                        <ScrollTextIcon class="opacity-50" /> {{ $t('activities.authoring.description') }}
                    </h2>
                    <TextEditor v-model="activity.description" class="min-h-64" />
                    <FieldError :error="errors.get('description')" />
                </Panel>

                <!-- An optional select's "none" is null here; the mapper writes it as the empty string PocketBase stores. -->
                <Panel id="section-families" class="scroll-mt-16">
                    <div class="tabs tabs-box">
                        <label class="tab gap-2 tooltip sm:before:hidden sm:after:hidden"
                            :data-tip="$t('activities.families.classification')">
                            <input type="radio" name="activity-families" value="classification" v-model="familyTab" />
                            <ShapesIcon class="opacity-50" />
                            <span class="sr-only sm:not-sr-only">{{ $t('activities.families.classification') }}</span>
                        </label>
                        <div class="tab-content p-3">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                                <Field label="activities.fields.format" :error="errors.get('format')">
                                    <select class="select w-full" v-model="activity.classification.format">
                                        <option :value="null">{{ $t('activities.fields.unset') }}</option>
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
                                <MultiSelect :items="practiceOptions" displayKey="label" keyBy="value"
                                    v-model="practices" />
                            </Field>
                        </div>

                        <label class="tab gap-2 tooltip sm:before:hidden sm:after:hidden"
                            :data-tip="$t('activities.families.imaginary')">
                            <input type="radio" name="activity-families" value="imaginary" v-model="familyTab" />
                            <SparklesIcon class="opacity-50" />
                            <span class="sr-only sm:not-sr-only">{{ $t('activities.families.imaginary') }}</span>
                        </label>
                        <div class="tab-content p-3">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                                <Field label="activities.fields.imaginaryRule" :error="errors.get('imaginary_rule')">
                                    <select class="select w-full" v-model="activity.imaginary.rule">
                                        <option :value="null">{{ $t('activities.fields.unset') }}</option>
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

                        <label class="tab gap-2 tooltip sm:before:hidden sm:after:hidden"
                            :data-tip="$t('activities.families.audience')">
                            <input type="radio" name="activity-families" value="audience" v-model="familyTab" />
                            <UsersIcon class="opacity-50" />
                            <span class="sr-only sm:not-sr-only">{{ $t('activities.families.audience') }}</span>
                        </label>
                        <div class="tab-content p-3">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                                <Field :error="errors.get('age_min') || errors.get('age_max')">
                                    <template #label>
                                        {{ $t('activities.fields.age') }}
                                        <span class="font-normal opacity-60">{{ $t(ageLabel.key, ageLabel.params)
                                            }}</span>
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
                                    <RangeInput class="text-primary" v-bind="PARTICIPANTS_BOUNDS"
                                        v-model:min="participantsMin" v-model:max="participantsMax" />
                                </Field>
                                <Field label="activities.fields.childrenPace" :error="errors.get('children_pace')">
                                    <select class="select w-full" v-model="activity.audience.childrenPace">
                                        <option :value="null">{{ $t('activities.fields.unset') }}</option>
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

                        <label class="tab gap-2 tooltip sm:before:hidden sm:after:hidden"
                            :data-tip="$t('activities.families.supervision')">
                            <input type="radio" name="activity-families" value="supervision" v-model="familyTab" />
                            <UserCheckIcon class="opacity-50" />
                            <span class="sr-only sm:not-sr-only">{{ $t('activities.families.supervision') }}</span>
                        </label>
                        <div class="tab-content p-3">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                                <Field label="activities.fields.hostEffort" :error="errors.get('host_effort')">
                                    <select class="select w-full" v-model="activity.supervision.hostEffort">
                                        <option :value="null">{{ $t('activities.fields.unset') }}</option>
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

                        <label class="tab gap-2 tooltip sm:before:hidden sm:after:hidden"
                            :data-tip="$t('activities.families.place')">
                            <input type="radio" name="activity-families" value="place" v-model="familyTab" />
                            <MapPinIcon class="opacity-50" />
                            <span class="sr-only sm:not-sr-only">{{ $t('activities.families.place') }}</span>
                        </label>
                        <div class="tab-content p-3">
                            <div class="flex gap-4">
                                <label class="label">
                                    <input type="checkbox" class="checkbox checkbox-sm"
                                        v-model="activity.place.indoor" />
                                    {{ $t('activities.fields.indoor') }}
                                </label>
                                <label class="label">
                                    <input type="checkbox" class="checkbox checkbox-sm"
                                        v-model="activity.place.outdoor" />
                                    {{ $t('activities.fields.outdoor') }}
                                </label>
                            </div>
                            <Field label="activities.fields.seasons" :error="errors.get('seasons')">
                                <MultiSelect :items="seasonOptions" displayKey="label" keyBy="value"
                                    v-model="seasons" />
                            </Field>
                            <Field label="activities.fields.locations" :error="errors.get('locations')">
                                <MultiSelect :items="locationOptions" displayKey="label" keyBy="value"
                                    v-model="locations" />
                            </Field>
                            <Field label="activities.fields.conditions" :error="errors.get('conditions')">
                                <TextEditor v-model="activity.place.conditions" class="min-h-24" />
                            </Field>
                        </div>

                        <label class="tab gap-2 tooltip sm:before:hidden sm:after:hidden"
                            :data-tip="$t('activities.families.pedagogy')">
                            <input type="radio" name="activity-families" value="pedagogy" v-model="familyTab" />
                            <GraduationCapIcon class="opacity-50" />
                            <span class="sr-only sm:not-sr-only">{{ $t('activities.families.pedagogy') }}</span>
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
                                <Field v-for="axis in DEVELOPMENT_AXES" :key="axis"
                                    :label="`activities.tagType.${axis}`">
                                    <TagSelect :items="tagOptions[axis]" displayKey="name" keyBy="id"
                                        v-model="activity.pedagogy.development[axis]" />
                                </Field>
                            </div>
                            <!-- The six axes share one relation, so its error shows once, under all of them. -->
                            <FieldError :error="errors.get('development_tags')" />
                        </div>
                    </div>
                </Panel>

                <Panel id="section-preparation" class="scroll-mt-16">
                    <div class="tabs tabs-box">
                        <label class="tab gap-2 tooltip sm:before:hidden sm:after:hidden"
                            :data-tip="$t('activities.families.safety')">
                            <input type="radio" name="activity-preparation" value="safety" v-model="preparationTab" />
                            <ShieldAlertIcon class="opacity-50" />
                            <span class="sr-only sm:not-sr-only">{{ $t('activities.families.safety') }}</span>
                        </label>
                        <div class="tab-content p-3">
                            <TagSelect :items="safetyInstructions" class="w-full" displayKey="name" keyBy="id"
                                v-model="activity.safety.instructions" />
                            <FieldError :error="errors.get('safety_instructions')" />
                        </div>

                        <label class="tab gap-2 tooltip sm:before:hidden sm:after:hidden"
                            :data-tip="$t('activities.materials.title')">
                            <input type="radio" name="activity-preparation" value="materials" v-model="preparationTab" />
                            <PackageOpenIcon class="opacity-50" />
                            <span class="sr-only sm:not-sr-only">{{ $t('activities.materials.title') }}</span>
                        </label>
                        <div class="tab-content p-3">
                            <MaterialsSelection v-model="activity.materials" @add="addMaterial" @create="createMaterial"
                                @remove="removeMaterial" />
                            <FieldError :error="errors.get('materials')" />
                        </div>

                        <label class="tab gap-2 tooltip sm:before:hidden sm:after:hidden"
                            :data-tip="$t('activities.tips.title')">
                            <input type="radio" name="activity-preparation" value="tips" v-model="preparationTab" />
                            <LightbulbIcon class="opacity-50" />
                            <span class="sr-only sm:not-sr-only">{{ $t('activities.tips.title') }}</span>
                        </label>
                        <div class="tab-content p-3">
                            <TagSelect :items="tips" displayKey="name" keyBy="id" class="w-full"
                                v-model="activity.tips" />
                            <FieldError :error="errors.get('tips')" />
                        </div>
                    </div>
                </Panel>

                <Panel id="section-workshops" class="scroll-mt-16">
                    <h2 class="text-2xl flex items-center gap-2">
                        <BookOpenIcon class="opacity-50" /> {{ $t('activities.workshops.title') }}
                    </h2>
                    <button class="btn btn-primary" @click="() => editWorkshop(newWorkshop())">
                        <PlusIcon class="opacity-50" />
                        {{ $t('actions.add') }}
                    </button>
                    <FieldError :error="errors.get('workshops')" />
                    <List :items="activity.workshops" v-slot="{ item }">
                        <div class="my-auto">
                            <div class="flex gap-2">
                                <b>{{ item.name }}</b>
                                <span v-if="item.theme" class="my-auto text-sm opacity-60">{{ item.theme }}</span>
                                <span v-if="item.adults_required" class="badge my-auto">
                                    {{ $t('activities.workshops.adults', { count: item.adults_required }) }}
                                </span>
                            </div>
                            <span v-if="item.challenges" v-html="item.challenges">
                            </span>
                        </div>

                        <div class="ms-auto my-auto flex gap-2">
                            <button class="btn btn-sm btn-soft btn-error btn-square"
                                @click="() => confirmRemoveWorkshop(item)">
                                <TrashIcon class="icon-sm" />
                            </button>
                            <button class="btn btn-sm btn-soft btn-square" @click="() => editWorkshop(item)">
                                <PenIcon class="icon-sm" />
                            </button>
                        </div>
                    </List>
                </Panel>

                <Panel id="section-steps" class="scroll-mt-16">
                    <h2 class="text-2xl flex items-center gap-2">
                        <ListOrderedIcon class="opacity-50" /> {{ $t('activities.authoring.steps.title') }}
                        <span class="ms-auto text-sm font-normal opacity-60">
                            {{ $t('activities.fields.preparationTime') }} {{ $t('activities.minutes', {
                                minutes:
                                    timing.preparation
                            })
                            }}
                            · {{ $t('activities.fields.playTime') }} {{ $t('activities.minutes', {
                                minutes: timing.play
                            }) }}
                        </span>
                    </h2>
                    <button class="btn btn-primary" @click="() => editStep(newStep())">
                        <PlusIcon class="opacity-50" />
                        {{ $t('actions.add') }}
                    </button>
                    <FieldError :error="errors.get('steps')" />
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
            </div>
        </div>
    </Container>
    <StepEditModal ref="stepModal" :materials="activity.materials" />
    <WorkshopEditModal ref="workshopModal" :materials="activity.materials" />
    <SectionsMenuModal ref="sectionsModal" :entries="sections" />
</template>
