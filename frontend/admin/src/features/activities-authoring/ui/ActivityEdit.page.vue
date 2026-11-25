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
import { Badge } from '@chapelure/ui/shadcn/badge';
import { Button } from '@chapelure/ui/shadcn/button';
import { Card, CardContent } from '@chapelure/ui/shadcn/card';
import { Checkbox } from '@chapelure/ui/shadcn/checkbox';
import { Input } from '@chapelure/ui/shadcn/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@chapelure/ui/shadcn/input-group';
import { Label } from '@chapelure/ui/shadcn/label';
import { NativeSelect, NativeSelectOption } from '@chapelure/ui/shadcn/native-select';
import { Spinner } from '@chapelure/ui/shadcn/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@chapelure/ui/shadcn/tabs';
import { Textarea } from '@chapelure/ui/shadcn/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@chapelure/ui/shadcn/tooltip';
import StepSummary from '@features/activities-authoring/ui/StepSummary.vue';
import {
    ActivityFormat,
    ActivityState,
    ChildrenPace,
    DEVELOPMENT_AXES,
    HostEffort,
    ImaginaryRule,
    SUMMARY_MAX_LENGTH,
} from '@features/activities/models/activity';
import { type ActivityStepData } from '@features/activities/models/step';
import { type ActivityWorkshopData } from '@features/activities/models/workshop';
import MaterialsSelection from '@features/activities-authoring/ui/MaterialsSelection.vue';
import SectionsMenuModal from '@features/activities-authoring/ui/SectionsMenu.modal.vue';
import SectionsMenu, { type SectionEntry } from '@features/activities-authoring/ui/SectionsMenu.vue';
import StepEditModal from '@features/activities-authoring/ui/StepEdit.modal.vue';
import WorkshopEditModal from '@features/activities-authoring/ui/WorkshopEdit.modal.vue';
import { useActivityEdit, useReferenceOptions } from '@features/activities-authoring/composables/useActivityEdit';
import { AGE_BOUNDS, PARTICIPANTS_BOUNDS } from '@features/activities-authoring/models/activity.edit';
import { routesNames } from '@features/activities-authoring/routes';
import {
    ArrowLeftIcon,
    BadgeCheckIcon,
    BookOpenIcon,
    ClipboardCheckIcon,
    ClipboardListIcon,
    GraduationCapIcon,
    LibraryIcon,
    ListOrderedIcon,
    MapPinIcon,
    MessageSquareIcon,
    PackageOpenIcon,
    PenIcon,
    PlusIcon,
    SaveIcon,
    ScrollTextIcon,
    ShapesIcon,
    ShieldAlertIcon,
    SparklesIcon,
    TableOfContentsIcon,
    ThumbsUpIcon,
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
    comments,
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
        ],
    },
    { key: 'workshops', label: 'activities.workshops.title', icon: BookOpenIcon, anchor: 'section-workshops' },
    { key: 'steps', label: 'activities.authoring.steps.title', icon: ListOrderedIcon, anchor: 'section-steps' },
    { key: 'comments', label: 'activities.authoring.comments.title', icon: MessageSquareIcon, anchor: 'section-comments' },
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
    <!-- The tooltips stand in for the labels a small screen hides; the desktop Sidebar's provider is not
         there on mobile. A tab's tooltip hangs on its content: on the trigger itself, the tooltip's
         `data-state` would override the tab's. -->
    <TooltipProvider>
        <!-- Padded, so neither the menu nor the buttons touch the sidebar or the window's edge. -->
        <Container class="px-2 pb-2">
            <div class="sticky top-0 z-10 flex gap-2 bg-background py-2">
                <Button variant="ghost" as-child>
                    <RouterLink :to="{ name: routesNames.all }">
                        <ArrowLeftIcon class="text-muted-foreground" /> {{ $t('actions.back') }}
                    </RouterLink>
                </Button>
                <Button variant="ghost" size="icon" class="lg:hidden" :aria-label="$t('activities.authoring.navigation.title')"
                    @click="openSections">
                    <TableOfContentsIcon class="text-muted-foreground" />
                </Button>

                <!-- Its own write: stores the state and leaves the form as it is. A new activity has
                     no record to write it to until its first save. The tooltip hangs on a wrapper, as
                     a disabled button fires no pointer events. -->
                <Tooltip>
                    <TooltipTrigger as-child>
                        <span class="ms-auto">
                            <Button variant="outline" :disabled="isChangingState || isNew" @click="changeState">
                                <Spinner v-if="isChangingState" />
                                <BadgeCheckIcon v-if="transition.to === ActivityState.PUBLISHED" />
                                <UndoIcon v-else />
                                <span class="sr-only sm:not-sr-only">{{ $t(transition.label) }}</span>
                            </Button>
                        </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" class="sm:hidden">{{ $t(transition.label) }}</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger as-child>
                        <span>
                            <Button :disabled="isLoading" @click="save">
                                <Spinner v-if="isLoading" />
                                <SaveIcon />
                                <span class="sr-only sm:not-sr-only">{{ $t('actions.save') }}</span>
                            </Button>
                        </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" class="sm:hidden">{{ $t('actions.save') }}</TooltipContent>
                </Tooltip>
            </div>
            <FieldError :error="errors.global.value" />

            <div class="grid gap-2 items-start lg:grid-cols-[14rem_minmax(0,1fr)]">
                <aside class="hidden lg:block sticky top-16 rounded-xl border bg-card shadow-sm">
                    <SectionsMenu :entries="sections" @select="goTo" />
                </aside>

                <div class="flex flex-col gap-2">
                    <Panel id="section-informations" class="scroll-mt-16">
                        <h2 class="text-2xl flex items-center gap-2">
                            <LibraryIcon class="text-muted-foreground" /> {{ $t('activities.families.informations') }}
                        </h2>
                        <Field label="activities.fields.name" :error="errors.get('name')">
                            <Input type="text" :aria-invalid="!!errors.get('name') || undefined" v-model="activity.name" />
                        </Field>
                        <Field label="activities.fields.summary" :error="errors.get('summary')">
                            <Textarea :aria-invalid="!!errors.get('summary') || undefined" :maxlength="SUMMARY_MAX_LENGTH"
                                v-model="activity.summary" />
                            <span class="self-end text-sm text-muted-foreground">
                                {{ $t('activities.constraints.summary', { count: activity.summary.length, max: SUMMARY_MAX_LENGTH }) }}
                            </span>
                        </Field>
                        <Field label="activities.fields.picture">
                            <FilesInput accept="image/*" @change="updateImage">
                                <template #constraints>
                                    {{ $t('activities.constraints.picture') }}
                                </template>
                            </FilesInput>
                            <FilesList v-model:files="files" />
                        </Field>
                        <Field label="activities.fields.visualBrief" :error="errors.get('visual_brief')">
                            <Textarea v-model="activity.visualBrief" />
                        </Field>
                    </Panel>

                    <Panel id="section-description" class="scroll-mt-16">
                        <h2 class="text-2xl flex items-center gap-2">
                            <ScrollTextIcon class="text-muted-foreground" /> {{ $t('activities.authoring.description') }}
                        </h2>
                        <TextEditor v-model="activity.description" class="min-h-64" />
                        <FieldError :error="errors.get('description')" />
                    </Panel>

                    <!-- An optional select's "none" is null here; the mapper writes it as the empty string PocketBase stores. -->
                    <Panel id="section-families" class="scroll-mt-16">
                        <Tabs v-model="familyTab">
                            <TabsList class="w-full">
                                <TabsTrigger value="classification">
                                    <Tooltip>
                                        <TooltipTrigger as-child>
                                            <span class="flex items-center gap-1.5">
                                                <ShapesIcon class="text-muted-foreground" />
                                                <span class="sr-only sm:not-sr-only">{{ $t('activities.families.classification') }}</span>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent class="sm:hidden">{{ $t('activities.families.classification') }}</TooltipContent>
                                    </Tooltip>
                                </TabsTrigger>
                                <TabsTrigger value="imaginary">
                                    <Tooltip>
                                        <TooltipTrigger as-child>
                                            <span class="flex items-center gap-1.5">
                                                <SparklesIcon class="text-muted-foreground" />
                                                <span class="sr-only sm:not-sr-only">{{ $t('activities.families.imaginary') }}</span>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent class="sm:hidden">{{ $t('activities.families.imaginary') }}</TooltipContent>
                                    </Tooltip>
                                </TabsTrigger>
                                <TabsTrigger value="audience">
                                    <Tooltip>
                                        <TooltipTrigger as-child>
                                            <span class="flex items-center gap-1.5">
                                                <UsersIcon class="text-muted-foreground" />
                                                <span class="sr-only sm:not-sr-only">{{ $t('activities.families.audience') }}</span>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent class="sm:hidden">{{ $t('activities.families.audience') }}</TooltipContent>
                                    </Tooltip>
                                </TabsTrigger>
                                <TabsTrigger value="supervision">
                                    <Tooltip>
                                        <TooltipTrigger as-child>
                                            <span class="flex items-center gap-1.5">
                                                <UserCheckIcon class="text-muted-foreground" />
                                                <span class="sr-only sm:not-sr-only">{{ $t('activities.families.supervision') }}</span>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent class="sm:hidden">{{ $t('activities.families.supervision') }}</TooltipContent>
                                    </Tooltip>
                                </TabsTrigger>
                                <TabsTrigger value="place">
                                    <Tooltip>
                                        <TooltipTrigger as-child>
                                            <span class="flex items-center gap-1.5">
                                                <MapPinIcon class="text-muted-foreground" />
                                                <span class="sr-only sm:not-sr-only">{{ $t('activities.families.place') }}</span>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent class="sm:hidden">{{ $t('activities.families.place') }}</TooltipContent>
                                    </Tooltip>
                                </TabsTrigger>
                                <TabsTrigger value="pedagogy">
                                    <Tooltip>
                                        <TooltipTrigger as-child>
                                            <span class="flex items-center gap-1.5">
                                                <GraduationCapIcon class="text-muted-foreground" />
                                                <span class="sr-only sm:not-sr-only">{{ $t('activities.families.pedagogy') }}</span>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent class="sm:hidden">{{ $t('activities.families.pedagogy') }}</TooltipContent>
                                    </Tooltip>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="classification" class="flex flex-col gap-4 p-3">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Field label="activities.fields.format" :error="errors.get('format')">
                                        <NativeSelect class="w-full" v-model="activity.classification.format">
                                            <NativeSelectOption :value="null">{{ $t('activities.fields.unset') }}</NativeSelectOption>
                                            <NativeSelectOption v-for="value in formats" :key="value" :value="value">
                                                {{ $t(`activities.format.${value}`) }}
                                            </NativeSelectOption>
                                        </NativeSelect>
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
                            </TabsContent>

                            <TabsContent value="imaginary" class="flex flex-col gap-4 p-3">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Field label="activities.fields.imaginaryRule" :error="errors.get('imaginary_rule')">
                                        <NativeSelect class="w-full" v-model="activity.imaginary.rule">
                                            <NativeSelectOption :value="null">{{ $t('activities.fields.unset') }}</NativeSelectOption>
                                            <NativeSelectOption v-for="value in imaginaryRules" :key="value" :value="value">
                                                {{ $t(`activities.imaginaryRule.${value}`) }}
                                            </NativeSelectOption>
                                        </NativeSelect>
                                    </Field>
                                    <Field label="activities.tagType.IMAGINARY" :error="errors.get('imaginary_tags')">
                                        <TagSelect :items="tagOptions.IMAGINARY" displayKey="name" keyBy="id"
                                            v-model="activity.imaginary.universes" />
                                    </Field>
                                </div>
                            </TabsContent>

                            <TabsContent value="audience" class="flex flex-col gap-4 p-3">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Field :error="errors.get('age_min') || errors.get('age_max')">
                                        <template #label>
                                            {{ $t('activities.fields.age') }}
                                            <span class="font-normal text-muted-foreground">{{ $t(ageLabel.key, ageLabel.params) }}</span>
                                        </template>
                                        <RangeInput v-bind="AGE_BOUNDS" v-model:min="ageMin" v-model:max="ageMax" />
                                    </Field>
                                    <Field :error="errors.get('participants_min') || errors.get('participants_max')">
                                        <template #label>
                                            {{ $t('activities.fields.participants') }}
                                            <span class="font-normal text-muted-foreground">{{ $t(participantsLabel.key, participantsLabel.params) }}</span>
                                        </template>
                                        <RangeInput v-bind="PARTICIPANTS_BOUNDS" v-model:min="participantsMin"
                                            v-model:max="participantsMax" />
                                    </Field>
                                    <Field label="activities.fields.childrenPace" :error="errors.get('children_pace')">
                                        <NativeSelect class="w-full" v-model="activity.audience.childrenPace">
                                            <NativeSelectOption :value="null">{{ $t('activities.fields.unset') }}</NativeSelectOption>
                                            <NativeSelectOption v-for="value in childrenPaces" :key="value" :value="value">
                                                {{ $t(`activities.childrenPace.${value}`) }}
                                            </NativeSelectOption>
                                        </NativeSelect>
                                    </Field>
                                </div>
                                <Field label="activities.fields.ageVariants" :error="errors.get('age_variants')">
                                    <TextEditor v-model="activity.audience.ageVariants" class="min-h-24" />
                                </Field>
                            </TabsContent>

                            <TabsContent value="supervision" class="flex flex-col gap-4 p-3">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Field label="activities.fields.hostEffort" :error="errors.get('host_effort')">
                                        <NativeSelect class="w-full" v-model="activity.supervision.hostEffort">
                                            <NativeSelectOption :value="null">{{ $t('activities.fields.unset') }}</NativeSelectOption>
                                            <NativeSelectOption v-for="value in hostEfforts" :key="value" :value="value">
                                                {{ $t(`activities.hostEffort.${value}`) }}
                                            </NativeSelectOption>
                                        </NativeSelect>
                                    </Field>
                                    <Field label="activities.fields.hosts" :error="errors.get('recommended_hosts_numbers')">
                                        <Input type="number" min="0"
                                            :aria-invalid="!!errors.get('recommended_hosts_numbers') || undefined"
                                            v-model.number="activity.supervision.hostsRequired" />
                                    </Field>
                                </div>
                                <Label class="font-normal">
                                    <Checkbox v-model="activity.supervision.crossSupervision" />
                                    {{ $t('activities.fields.crossSupervision') }}
                                </Label>
                                <Field label="activities.fields.supervisionNotes" :error="errors.get('supervision_notes')">
                                    <TextEditor v-model="activity.supervision.notes" class="min-h-24" />
                                </Field>
                            </TabsContent>

                            <TabsContent value="place" class="flex flex-col gap-4 p-3">
                                <div class="flex gap-4">
                                    <Label class="font-normal">
                                        <Checkbox v-model="activity.place.indoor" />
                                        {{ $t('activities.fields.indoor') }}
                                    </Label>
                                    <Label class="font-normal">
                                        <Checkbox v-model="activity.place.outdoor" />
                                        {{ $t('activities.fields.outdoor') }}
                                    </Label>
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
                            </TabsContent>

                            <TabsContent value="pedagogy" class="flex flex-col gap-4 p-3">
                                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                            </TabsContent>
                        </Tabs>
                    </Panel>

                    <Panel id="section-preparation" class="scroll-mt-16">
                        <Tabs v-model="preparationTab">
                            <TabsList class="w-full">
                                <TabsTrigger value="safety">
                                    <Tooltip>
                                        <TooltipTrigger as-child>
                                            <span class="flex items-center gap-1.5">
                                                <ShieldAlertIcon class="text-muted-foreground" />
                                                <span class="sr-only sm:not-sr-only">{{ $t('activities.families.safety') }}</span>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent class="sm:hidden">{{ $t('activities.families.safety') }}</TooltipContent>
                                    </Tooltip>
                                </TabsTrigger>
                                <TabsTrigger value="materials">
                                    <Tooltip>
                                        <TooltipTrigger as-child>
                                            <span class="flex items-center gap-1.5">
                                                <PackageOpenIcon class="text-muted-foreground" />
                                                <span class="sr-only sm:not-sr-only">{{ $t('activities.materials.title') }}</span>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent class="sm:hidden">{{ $t('activities.materials.title') }}</TooltipContent>
                                    </Tooltip>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="safety" class="flex flex-col gap-2 p-3">
                                <TagSelect :items="safetyInstructions" class="w-full" displayKey="name" keyBy="id"
                                    v-model="activity.safety.instructions" />
                                <FieldError :error="errors.get('safety_instructions')" />
                            </TabsContent>

                            <TabsContent value="materials" class="flex flex-col gap-2 p-3">
                                <MaterialsSelection v-model="activity.materials" @add="addMaterial" @create="createMaterial"
                                    @remove="removeMaterial" />
                                <FieldError :error="errors.get('materials')" />
                            </TabsContent>
                        </Tabs>
                    </Panel>

                    <Panel id="section-workshops" class="scroll-mt-16">
                        <h2 class="text-2xl flex items-center gap-2">
                            <BookOpenIcon class="text-muted-foreground" /> {{ $t('activities.workshops.title') }}
                        </h2>
                        <Button @click="() => editWorkshop(newWorkshop())">
                            <PlusIcon />
                            {{ $t('actions.add') }}
                        </Button>
                        <FieldError :error="errors.get('workshops')" />
                        <List :items="activity.workshops" v-slot="{ item }">
                            <div class="flex-1">
                                <div class="flex items-center gap-2">
                                    <b>{{ item.name }}</b>
                                    <span v-if="item.theme" class="text-sm text-muted-foreground">{{ item.theme }}</span>
                                    <Badge v-if="item.adults_required" variant="outline">
                                        {{ $t('activities.workshops.adults', { count: item.adults_required }) }}
                                    </Badge>
                                </div>
                                <span v-if="item.challenges" v-html="item.challenges">
                                </span>
                            </div>

                            <div class="flex gap-2">
                                <Button variant="destructive" size="icon-sm" @click="() => confirmRemoveWorkshop(item)">
                                    <TrashIcon />
                                </Button>
                                <Button variant="secondary" size="icon-sm" @click="() => editWorkshop(item)">
                                    <PenIcon />
                                </Button>
                            </div>
                        </List>
                    </Panel>

                    <Panel id="section-steps" class="scroll-mt-16">
                        <h2 class="text-2xl flex items-center gap-2">
                            <ListOrderedIcon class="text-muted-foreground" /> {{ $t('activities.authoring.steps.title') }}
                            <span class="ms-auto text-sm font-normal text-muted-foreground">
                                {{ $t('activities.fields.preparationTime') }} {{ $t('activities.minutes', { minutes: timing.preparation }) }}
                                · {{ $t('activities.fields.playTime') }} {{ $t('activities.minutes', { minutes: timing.play }) }}
                            </span>
                        </h2>
                        <Field label="activities.fields.gatherDuration" :error="errors.get('gather_duration')" class="md:w-64">
                            <InputGroup>
                                <InputGroupInput type="number" min="0" v-model.number="activity.gatherDuration" />
                                <InputGroupAddon align="inline-end">{{ $t('activities.authoring.steps.minutes') }}</InputGroupAddon>
                            </InputGroup>
                        </Field>
                        <Button @click="() => editStep(newStep())">
                            <PlusIcon />
                            {{ $t('actions.add') }}
                        </Button>
                        <FieldError :error="errors.get('steps')" />
                        <List :items="activity.steps" v-slot="{ item, index }">
                            <StepSummary :index="index" :step="item" />

                            <div class="flex gap-2">
                                <Button variant="destructive" size="icon" @click="() => confirmRemoveStep(item)">
                                    <TrashIcon />
                                </Button>
                                <Button variant="secondary" size="icon" @click="() => editStep(item)">
                                    <PenIcon />
                                </Button>
                            </div>
                        </List>
                    </Panel>

                    <!-- Read only: users write their comments from the feedback screen, after a run. -->
                    <Panel id="section-comments" class="scroll-mt-16">
                        <h2 class="text-2xl flex items-center gap-2">
                            <MessageSquareIcon class="text-muted-foreground" /> {{ $t('activities.authoring.comments.title') }}
                            <Badge variant="outline">{{ comments.length }}</Badge>
                        </h2>
                        <p v-if="!comments.length" class="text-muted-foreground">{{ $t('activities.authoring.comments.empty') }}</p>
                        <Card v-for="comment in comments" :key="comment.id" class="py-4 shadow-none">
                            <CardContent class="flex flex-col gap-2 px-4">
                                <div class="flex items-center gap-2 text-sm text-muted-foreground">
                                    <b>{{ $t('activities.authoring.comments.anonymous') }}</b>
                                    <span>· {{ $d(comment.updated) }}</span>
                                    <ThumbsUpIcon v-if="comment.liked" class="icon-sm text-primary fill-current ms-auto"
                                        :aria-label="$t('activities.authoring.comments.liked')" />
                                </div>
                                <p class="whitespace-pre-line">{{ comment.comment }}</p>
                            </CardContent>
                        </Card>
                    </Panel>
                </div>
            </div>
        </Container>
        <StepEditModal ref="stepModal" :materials="activity.materials" :tips="tips" />
        <WorkshopEditModal ref="workshopModal" :materials="activity.materials" />
        <SectionsMenuModal ref="sectionsModal" :entries="sections" />
    </TooltipProvider>
</template>
